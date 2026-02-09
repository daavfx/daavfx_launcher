#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dashmap::DashMap;
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, Runtime, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;
use axum::{routing::post, Router};
use tower_http::cors::{Any, CorsLayer};

mod ai;

#[derive(Clone, Serialize)]
struct LogPayload {
    app_id: String,
    message: String,
    #[serde(rename = "type")]
    log_type: String, // "info", "error", "warn"
}

#[derive(Clone, Serialize)]
struct PulsePayload {
    balance: String,
    equity: String,
    drawdown: String,
    timestamp: i64,
}

struct ProcessRegistry {
    children: DashMap<String, Arc<Mutex<Child>>>,
}

impl ProcessRegistry {
    fn new() -> Self {
        Self {
            children: DashMap::new(),
        }
    }
}

/// Returns the reserved Vite dev server port for each app.
/// Each app MUST have a unique port. If blocked, it's a zombie.
fn get_app_port(app_id: &str) -> Option<u16> {
    match app_id {
        "launcher" => Some(1424),
        "mql_fixer" => Some(1426),
        "copytrader" => Some(1427),
        "dashboard" => Some(1429),
        "charting" | "backtester" => Some(1430),
        "quantum_bt" => Some(1431),
        _ => None,
    }
}

/// Kills any process using the specified port (Windows only).
/// This is used to auto-kill zombie Vite dev servers from previous runs.
#[cfg(target_os = "windows")]
fn kill_zombie_on_port(port: u16) {
    use std::process::Command as StdCommand;
    
    // Use netstat to find the PID using this port
    let output = StdCommand::new("cmd")
        .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
        .output();
    
    if let Ok(output) = output {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            // Parse the PID from the last column (e.g., "LISTENING       12345")
            let parts: Vec<&str> = line.split_whitespace().collect();
            if let Some(pid_str) = parts.last() {
                if let Ok(pid) = pid_str.parse::<u32>() {
                    if pid > 0 {
                        // Kill the process
                        let _ = StdCommand::new("taskkill")
                            .args(&["/PID", &pid.to_string(), "/F", "/T"])
                            .output();
                        println!("[Launcher] Killed zombie process {} on port {}", pid, port);
                    }
                }
            }
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn kill_zombie_on_port(_port: u16) {
    // Placeholder for non-Windows systems
}

fn get_apps_base_path<R: Runtime>(app_handle: &AppHandle<R>) -> Result<PathBuf, String> {
    // Better way for executable dir
    let exe_path = std::env::current_exe().map_err(|e| format!("Failed to get current exe: {}", e))?;
    let exe_dir = exe_path.parent().ok_or("Failed to get parent of exe")?;

    // In dev mode (cargo tauri dev), app_exe_dir is deep in target/debug
    // We need to go up to the main 'launcher' directory's parent (APPS)
    let base_path = if exe_dir.to_string_lossy().contains("target") {
        // ...APPS/launcher/src-tauri/target/debug -> ...APPS/
        exe_dir
            .parent() // debug
            .and_then(|p: &Path| p.parent()) // target
            .and_then(|p: &Path| p.parent()) // src-tauri
            .and_then(|p: &Path| p.parent()) // launcher
            .ok_or("Failed to traverse to APPS root from target directory")?
            .to_path_buf()
    } else {
        // Production: ...APPS/launcher -> ...APPS/
        exe_dir
            .parent()
            .ok_or("Failed to traverse to APPS root from production directory")?
            .to_path_buf()
    };

    Ok(base_path)
}

#[tauri::command]
async fn launch_app<R: Runtime>(
    app_id: String,
    app_handle: AppHandle<R>,
    registry: State<'_, ProcessRegistry>,
) -> Result<(), String> {
    // STEP 1: Kill any zombie process on this app's reserved port
    if let Some(port) = get_app_port(&app_id) {
        kill_zombie_on_port(port);
        // Small delay to allow port release
        std::thread::sleep(std::time::Duration::from_millis(100));
    }

    // STEP 2: Kill our tracked child if it exists in registry
    // Check if already running - if so, Kill it (force restart)
    if registry.children.contains_key(&app_id) {
        if let Some((_, child_arc)) = registry.children.remove(&app_id) {
            let mut child = child_arc.lock().await;
            
             // Best effort kill
            #[cfg(target_os = "windows")]
            let _ = child.kill().await;
            
            #[cfg(not(target_os = "windows"))]
            let _ = child.kill().await;

            // Wait a bit for cleanup
            drop(child);
        }
    }

    let base_path = get_apps_base_path(&app_handle)?;
    
    let (dir_name, cmd_str) = match app_id.as_str() {
        "quantum_bt" => ("quantum_bt_daavfx", "npm run tauri dev"),
        "charting" | "backtester" => ("charting_daavfx", "npm run tauri dev"),
        "copytrader" => ("copytrader_ui", "npm run tauri dev"),
        "dashboard" => ("dashboard/logic-canvas-main", "npm run tauri dev"),
        "mql_fixer" => ("rust_mql_fixer", "npm run tauri dev"),
        _ => return Err(format!("Unknown app ID: {}", app_id)),
    };

    let app_path = base_path.join(dir_name);
    if !app_path.exists() {
        return Err(format!("App directory not found: {:?}", app_path));
    }

    // On Windows, complex commands like "npm run ..." are best run through cmd /C
    #[cfg(target_os = "windows")]
    let mut command = Command::new("cmd");
    #[cfg(target_os = "windows")]
    command.args(&["/C", cmd_str]);
    
    // FATAL FIX: Inject Cargo path explicitly for child processes
    // The launcher environment might have it, but we ensure the child has it too.
    if let Ok(path_val) = std::env::var("PATH") {
        let cargo_bin = format!("{}\\.cargo\\bin", std::env::var("USERPROFILE").unwrap_or_default());
        command.env("PATH", format!("{};{}", path_val, cargo_bin));
    }

    #[cfg(not(target_os = "windows"))]
    let mut command = Command::new("sh");
    #[cfg(not(target_os = "windows"))]
    command.args(&["-c", cmd_str]);

    command
        .current_dir(&app_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null());

    let mut child = command.spawn().map_err(|e| format!("Failed to spawn {}: {}", app_id, e))?;
    
    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let child_arc = Arc::new(Mutex::new(child));
    registry.children.insert(app_id.clone(), child_arc);

    // Spawn monitoring tasks for stdout/stderr
    let h_stdout = app_handle.clone();
    let id_stdout = app_id.clone();
    tauri::async_runtime::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = h_stdout.emit("app-log", LogPayload {
                app_id: id_stdout.clone(),
                message: line,
                log_type: "info".to_string(),
            });
        }
    });

    let h_stderr = app_handle.clone();
    let id_stderr = app_id.clone();
    tauri::async_runtime::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = h_stderr.emit("app-log", LogPayload {
                app_id: id_stderr.clone(),
                message: line,
                log_type: "error".to_string(),
            });
        }
    });

    Ok(())
}

#[tauri::command]
async fn kill_app(app_id: String, registry: State<'_, ProcessRegistry>) -> Result<(), String> {
    if let Some((_, child_mutex)) = registry.children.remove(&app_id) {
        let mut child = child_mutex.lock().await;
        child.kill().await.map_err(|e| format!("Failed to kill {}: {}", app_id, e))?;
        Ok(())
    } else {
        Err(format!("App '{}' is not running", app_id))
    }
}

#[tauri::command]
fn launch_mt4() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
fn launch_mt5() -> Result<(), String> {
    Ok(())
}

fn main() {
    let ai_state = Arc::new(ai::AIState::default());
    let ai_state_for_tauri = ai_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(ProcessRegistry::new())
        .manage(ai_state_for_tauri)
        .setup(move |app| {
            let handle = app.handle().clone();
            let shared_context = Arc::new((handle.clone(), ai_state));

            // Start AI HTTP Server for other apps (Dashboard, etc.)
            tauri::async_runtime::spawn(async move {
                let cors = CorsLayer::new()
                    .allow_origin(Any)
                    .allow_methods(Any)
                    .allow_headers(Any);

                let app = Router::new()
                    .route("/ai/ask", post(ai::ai_http_handler))
                    .layer(cors)
                    .with_state(shared_context);

                println!("AI singleton server listening on http://0.0.0.0:3030");
                let listener = tokio::net::TcpListener::bind("0.0.0.0:3030").await.unwrap();
                axum::serve(listener, app).await.unwrap();
            });

            // Start MT4 Pulse Monitor
            let h_pulse = handle.clone();
            let base_path_pulse = get_apps_base_path(&handle).unwrap_or_else(|_| PathBuf::from("."));
            tauri::async_runtime::spawn(async move {
                let pulse_path = base_path_pulse
                    .parent().unwrap_or(&base_path_pulse) // level up from APPS to main_ecosystem_trading
                    .join("trading_algorithms")
                    .join("mt4_implementation")
                    .join("MT4")
                    .join("MQL4")
                    .join("Files")
                    .join("Ryiuk_AccountPulse.csv");

                println!("Monitoring MT4 Pulse at: {:?}", pulse_path);
                
                let mut last_processed_time = 0;
                let mut interval = tokio::time::interval(std::time::Duration::from_millis(1000));
                
                loop {
                    interval.tick().await;
                    if pulse_path.exists() {
                        if let Ok(content) = std::fs::read_to_string(&pulse_path) {
                            let parts: Vec<&str> = content.trim().split(',').collect();
                            if parts.len() >= 4 {
                                let timestamp: i64 = parts[3].parse().unwrap_or(0);
                                if timestamp > last_processed_time {
                                    let _ = h_pulse.emit("account-pulse", PulsePayload {
                                        balance: parts[0].to_string(),
                                        equity: parts[1].to_string(),
                                        drawdown: parts[2].to_string(),
                                        timestamp,
                                    });
                                    last_processed_time = timestamp;
                                }
                            }
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            launch_app,
            kill_app,
            launch_mt4,
            launch_mt5,
            ai::ask_local_ai
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
