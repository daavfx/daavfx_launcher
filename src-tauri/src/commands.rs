//! Tauri commands for Quantum Apex

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::Emitter;
use trading_core::{
    data::dukascopy::{DukascopyClient, DownloadProgress, DownloadRequest},
    data::mt5_csv::generate_mt5_csv,
    terminal::detector::{Mt5Installation, detect_mt5_terminals},
    Symbol, Tick,
};
use chrono::NaiveDate;

/// App state for managing downloads
pub struct AppState {
    pub current_download: Mutex<Option<DownloadSession>>,
    pub detected_terminals: Mutex<Vec<Mt5Installation>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            current_download: Mutex::new(None),
            detected_terminals: Mutex::new(Vec::new()),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadSession {
    pub symbol: String,
    pub start_date: String,
    pub end_date: String,
    pub progress: DownloadProgress,
    pub ticks: Vec<Tick>,
    pub cancelled: bool,
}

// ============ Terminal Detection Commands ============

#[derive(Debug, Serialize)]
pub struct TerminalInfo {
    pub name: String,
    pub data_path: String,
    pub custom_symbols_path: String,
    pub is_default: bool,
}

#[tauri::command]
pub async fn detect_terminals() -> Result<Vec<TerminalInfo>, String> {
    let terminals = detect_mt5_terminals()
        .map_err(|e| e.to_string())?;
    
    Ok(terminals.into_iter().map(|t| TerminalInfo {
        name: t.name,
        data_path: t.data_path.to_string_lossy().to_string(),
        custom_symbols_path: t.custom_symbols_path.to_string_lossy().to_string(),
        is_default: t.is_default,
    }).collect())
}

// ============ Symbol Commands ============

#[derive(Debug, Serialize)]
pub struct SymbolInfo {
    pub name: String,
    pub display_name: String,
    pub category: String,
}

#[tauri::command]
pub fn get_available_symbols() -> Vec<SymbolInfo> {
    vec![
        SymbolInfo { name: "EURUSD".to_string(), display_name: "EUR/USD".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "GBPUSD".to_string(), display_name: "GBP/USD".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "USDJPY".to_string(), display_name: "USD/JPY".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "USDCHF".to_string(), display_name: "USD/CHF".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "AUDUSD".to_string(), display_name: "AUD/USD".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "USDCAD".to_string(), display_name: "USD/CAD".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "NZDUSD".to_string(), display_name: "NZD/USD".to_string(), category: "Forex Major".to_string() },
        SymbolInfo { name: "XAUUSD".to_string(), display_name: "Gold (XAU/USD)".to_string(), category: "Metals".to_string() },
        SymbolInfo { name: "XAGUSD".to_string(), display_name: "Silver (XAG/USD)".to_string(), category: "Metals".to_string() },
    ]
}

#[derive(Debug, Serialize)]
pub struct DateRange {
    pub start: String,
    pub end: String,
}

#[tauri::command]
pub fn get_date_range(symbol: String) -> Result<DateRange, String> {
    let sym = Symbol::from_str(&symbol)
        .ok_or_else(|| format!("Unknown symbol: {}", symbol))?;
    
    let (start, end) = DukascopyClient::get_available_range(&sym);
    
    Ok(DateRange {
        start: start.to_string(),
        end: end.to_string(),
    })
}

// ============ Download Commands ============

#[derive(Debug, Deserialize)]
pub struct DownloadParams {
    pub symbol: String,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Serialize)]
pub struct DownloadResult {
    pub success: bool,
    pub tick_count: u64,
    pub message: String,
    pub output_path: Option<String>,
}

#[tauri::command]
pub async fn download_tick_data(
    params: DownloadParams,
    app_handle: tauri::AppHandle,
) -> Result<DownloadResult, String> {
    let symbol = Symbol::from_str(&params.symbol)
        .ok_or_else(|| format!("Unknown symbol: {}", params.symbol))?;
    
    let start_date = NaiveDate::parse_from_str(&params.start_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid start date: {}", e))?;
    
    let end_date = NaiveDate::parse_from_str(&params.end_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid end date: {}", e))?;
    
    if start_date > end_date {
        return Err("Start date must be before end date".to_string());
    }
    
    let client = DukascopyClient::new();
    let request = DownloadRequest {
        symbol,
        start_date,
        end_date,
    };
    
    // Create progress callback that emits events to frontend
    let app_handle_clone = app_handle.clone();
    let progress_callback = Box::new(move |progress: DownloadProgress| {
        let _ = app_handle_clone.emit("download-progress", &progress);
    });
    
    let ticks = client.download_ticks(&request, Some(progress_callback))
        .await
        .map_err(|e| e.to_string())?;
    
    let tick_count = ticks.len() as u64;
    
    // Generate output path
    let output_dir = dirs::download_dir()
        .or_else(|| std::env::current_dir().ok())
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    let output_path = output_dir.join(format!(
        "{}_{}_to_{}.csv",
        params.symbol,
        params.start_date.replace("-", ""),
        params.end_date.replace("-", "")
    ));
    
    // Write CSV
    generate_mt5_csv(&ticks, &output_path)
        .map_err(|e| e.to_string())?;
    
    Ok(DownloadResult {
        success: true,
        tick_count,
        message: format!("Downloaded {} ticks", tick_count),
        output_path: Some(output_path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn export_to_csv(
    ticks_json: String,
    output_path: String,
) -> Result<u64, String> {
    let ticks: Vec<Tick> = serde_json::from_str(&ticks_json)
        .map_err(|e| format!("Failed to parse ticks: {}", e))?;
    
    generate_mt5_csv(&ticks, &output_path)
        .map_err(|e| e.to_string())
}

#[derive(Debug, Serialize)]
pub struct DownloadStatus {
    pub is_downloading: bool,
    pub progress: Option<DownloadProgress>,
}

#[tauri::command]
pub fn get_download_status() -> DownloadStatus {
    // For now, return not downloading
    // TODO: Implement proper state tracking
    DownloadStatus {
        is_downloading: false,
        progress: None,
    }
}

#[tauri::command]
pub fn cancel_download() -> Result<(), String> {
    // TODO: Implement cancellation via tokio CancellationToken
    Ok(())
}

// ============ Visual Backtest Commands ============

#[derive(Debug, Serialize)]
pub struct TickData {
    pub time: i64,      // Unix timestamp
    pub bid: f64,
    pub ask: f64,
}

#[derive(Debug, Serialize)]
pub struct LoadTickResult {
    pub success: bool,
    pub tick_count: u64,
    pub ticks: Vec<TickData>,
    pub message: String,
}

/// Load tick data from a CSV file for visual backtesting
#[tauri::command]
pub async fn load_tick_data(file_path: Option<String>) -> Result<LoadTickResult, String> {
    // If no path provided, return empty result (frontend will use demo data)
    let path = match file_path {
        Some(p) => p,
        None => {
            return Ok(LoadTickResult {
                success: true,
                tick_count: 0,
                ticks: vec![],
                message: "No file specified - use demo data".to_string(),
            });
        }
    };
    
    // Read and parse the CSV
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let mut ticks = Vec::new();
    
    for line in content.lines() {
        // Skip header
        if line.starts_with("date") || line.starts_with("Date") { continue; }
        
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() >= 4 {
            // Parse MT5 format: date, time, bid, ask, ...
            if let (Ok(bid), Ok(ask)) = (parts[2].parse::<f64>(), parts[3].parse::<f64>()) {
                let datetime_str = format!("{} {}", parts[0], parts[1]);
                if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(&datetime_str, "%Y.%m.%d %H:%M:%S%.3f") {
                    ticks.push(TickData {
                        time: dt.and_utc().timestamp(),
                        bid,
                        ask,
                    });
                }
            }
        }
    }
    
    let tick_count = ticks.len() as u64;
    
    Ok(LoadTickResult {
        success: true,
        tick_count,
        ticks,
        message: format!("Loaded {} ticks from {}", tick_count, path),
    })
}

/// Run a visual backtest step by step, streaming events
#[derive(Debug, Serialize, Clone)]
pub struct BacktestEvent {
    pub event_type: String,     // "tick", "open_trade", "close_trade", "update"
    pub timestamp: i64,
    pub data: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct VisualBacktestParams {
    pub ticks_path: Option<String>,
    pub setfile_path: Option<String>,
    pub initial_balance: f64,
    pub speed_multiplier: f64,
}

#[derive(Debug, Serialize)]
pub struct BacktestProgress {
    pub tick_index: u64,
    pub total_ticks: u64,
    pub balance: f64,
    pub equity: f64,
    pub open_trades: u32,
    pub closed_trades: u32,
    pub current_price: f64,
}

/// Start visual backtest - streams progress events
#[tauri::command]
pub async fn start_visual_backtest(
    params: VisualBacktestParams,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    use tokio::time::{sleep, Duration};
    
    // Load ticks
    let ticks_result = load_tick_data(params.ticks_path).await?;
    
    if ticks_result.ticks.is_empty() {
        return Err("No ticks to backtest".to_string());
    }
    
    let total_ticks = ticks_result.ticks.len() as u64;
    let mut balance = params.initial_balance;
    let equity = balance;
    
    // Stream progress events
    for (i, tick) in ticks_result.ticks.iter().enumerate() {
        let progress = BacktestProgress {
            tick_index: i as u64,
            total_ticks,
            balance,
            equity,
            open_trades: 0,
            closed_trades: 0,
            current_price: (tick.bid + tick.ask) / 2.0,
        };
        
        let _ = app_handle.emit("backtest-progress", &progress);
        
        // Delay based on speed
        if params.speed_multiplier < 100.0 {
            let delay_ms = (10.0 / params.speed_multiplier).max(1.0) as u64;
            sleep(Duration::from_millis(delay_ms)).await;
        }
        
        // Check for cancellation every 1000 ticks
        if i % 1000 == 0 {
            tokio::task::yield_now().await;
        }
    }
    
    Ok(format!("Backtest complete: {} ticks processed", total_ticks))
}

// ============ Monte Carlo Optimization Commands ============

use crate::monte_carlo::{MonteCarloOptimizer, OptimizationConfig, OptimizationResult, MonteCarloStats, ParameterRange, OptimizationObjective};
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct MonteCarloParams {
    pub parameters: Vec<ParamRangeInput>,
    pub monte_carlo_runs: usize,
    pub parallel_workers: usize,
    pub setfile_path: String,
    pub ticks_path: String,
    pub objective: String,
}

#[derive(Debug, Deserialize)]
pub struct ParamRangeInput {
    pub name: String,
    pub min: f64,
    pub max: f64,
    pub step: f64,
    #[serde(default)]
    pub is_integer: bool,
}

#[derive(Debug, Serialize)]
pub struct OptimizationOutput {
    pub results: Vec<OptimizationResult>,
    pub total_combinations: usize,
    pub elapsed_ms: u64,
}

/// Start Monte Carlo optimization
#[tauri::command]
pub async fn start_monte_carlo_optimization(
    params: MonteCarloParams,
    app_handle: tauri::AppHandle,
) -> Result<OptimizationOutput, String> {
    use std::time::Instant;
    
    let start = Instant::now();
    
    // Convert input to config
    let objective = match params.objective.as_str() {
        "max_profit" => OptimizationObjective::MaxProfit,
        "max_pf" | "max_profit_factor" => OptimizationObjective::MaxProfitFactor,
        "min_dd" | "min_drawdown" => OptimizationObjective::MinDrawdown,
        "max_sharpe" => OptimizationObjective::MaxSharpe,
        "max_wr" | "max_win_rate" => OptimizationObjective::MaxWinRate,
        _ => OptimizationObjective::MaxProfit,
    };
    
    let config = OptimizationConfig {
        parameters: params.parameters.into_iter().map(|p| ParameterRange {
            name: p.name,
            min: p.min,
            max: p.max,
            step: p.step,
            is_integer: p.is_integer,
        }).collect(),
        monte_carlo_runs: params.monte_carlo_runs,
        parallel_workers: params.parallel_workers,
        setfile_path: params.setfile_path,
        ticks_path: params.ticks_path,
        objective,
    };
    
    let optimizer = MonteCarloOptimizer::new(config);
    let total_combinations = optimizer.generate_combinations().len();
    
    // Emit start event
    let _ = app_handle.emit("optimization-started", serde_json::json!({
        "total_combinations": total_combinations
    }));
    
    let results = optimizer.run_sync();
    
    let elapsed = start.elapsed().as_millis() as u64;
    
    // Emit complete event
    let _ = app_handle.emit("optimization-complete", serde_json::json!({
        "results_count": results.len(),
        "elapsed_ms": elapsed
    }));
    
    Ok(OptimizationOutput {
        results,
        total_combinations,
        elapsed_ms: elapsed,
    })
}

#[derive(Debug, Deserialize)]
pub struct MonteCarloStatsParams {
    pub params: HashMap<String, f64>,
    pub monte_carlo_runs: usize,
    pub setfile_path: String,
    pub ticks_path: String,
}

/// Run Monte Carlo analysis on specific parameters
#[tauri::command]
pub async fn get_monte_carlo_stats(
    params: MonteCarloStatsParams,
) -> Result<MonteCarloStats, String> {
    let config = OptimizationConfig {
        parameters: vec![],
        monte_carlo_runs: params.monte_carlo_runs,
        parallel_workers: 1,
        setfile_path: params.setfile_path,
        ticks_path: params.ticks_path,
        objective: OptimizationObjective::MaxProfit,
    };
    
    let optimizer = MonteCarloOptimizer::new(config);
    let stats = optimizer.run_monte_carlo(&params.params);
    
    Ok(stats)
}
