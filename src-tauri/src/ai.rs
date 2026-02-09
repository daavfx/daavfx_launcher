use tauri::{AppHandle, Manager, Runtime};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};
use axum::response::IntoResponse;

// Structure to hold the model state so we don't reload it every time
#[derive(Default)]
pub struct AIState {
    pub model: Mutex<Option<Arc<dyn llm::Model>>>,
}

#[derive(Debug, Deserialize)]
pub struct AiRequest {
    pub prompt: String,
    pub system_context: String,
}

#[derive(Debug, Serialize)]
pub struct AiResponse {
    pub response: String,
}

async fn get_or_load_model<R: Runtime>(app: &AppHandle<R>, state: &AIState) -> Result<Arc<dyn llm::Model>, String> {
    let mut model_lock = state.model.lock().await;
    
    if let Some(model) = &*model_lock {
        return Ok(model.clone());
    }

    // Resolve model path
    let model_path = app.path().resource_dir()
        .map_err(|e| e.to_string())?
        .join("models")
        .join("qwen2.5-0.5b-instruct-q4_k_m.gguf");

    if !model_path.exists() {
        return Err(format!("Model file not found at: {:?}. Please run download_model.ps1.", model_path));
    }

    let architecture = llm::ModelArchitecture::Llama;
    let tokenizer_source = llm::TokenizerSource::Embedded;
    
    let model = llm::load_dynamic(
        Some(architecture),
        &model_path,
        tokenizer_source,
        Default::default(),
        |_| {}
    ).map_err(|e| format!("Failed to load model: {}", e))?;

    let model_arc: Arc<dyn llm::Model> = Arc::from(model);
    *model_lock = Some(model_arc.clone());
    
    Ok(model_arc)
}

#[tauri::command]
pub async fn ask_local_ai<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, AIState>,
    prompt: String,
    system_context: String
) -> Result<String, String> {
    let model = get_or_load_model(&app, &*state).await?;
    run_inference(model, prompt, system_context).await
}

pub async fn run_inference(model: Arc<dyn llm::Model>, prompt: String, system_context: String) -> Result<String, String> {
    // Construct Prompt (ChatML format for Qwen)
    let formatted_prompt = format!(
        "<|im_start|>system\n{}<|im_end|>\n<|im_start|>user\n{}<|im_end|>\n<|im_start|>assistant\n",
        system_context,
        prompt
    );

    let mut session = model.start_session(Default::default());
    let mut response_text = String::new();

    let _ = session.infer::<std::convert::Infallible>(
        model.as_ref(),
        &mut rand::thread_rng(),
        &llm::InferenceRequest {
            prompt: formatted_prompt.as_str().into(),
            parameters: &Default::default(),
            play_back_previous_tokens: false,
            maximum_token_count: Some(1024),
        },
        &mut Default::default(),
        |t| {
            if let llm::InferenceResponse::SnapshotToken(token) = t {
                response_text.push_str(&token);
            }
            Ok(llm::InferenceFeedback::Continue)
        }
    );

    Ok(response_text)
}

// Axum handler for external apps (Dashboard/Tactical)
pub async fn ai_http_handler(
    axum::extract::State(state): axum::extract::State<Arc<(AppHandle, Arc<AIState>)>>,
    axum::Json(payload): axum::Json<AiRequest>
) -> Response {
    let (app, ai_state) = &*state;
    
    match get_or_load_model(app, ai_state).await {
        Ok(model) => {
            match run_inference(model, payload.prompt, payload.system_context).await {
                Ok(resp) => axum::Json(AiResponse { response: resp }).into_response(),
                Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
            }
        },
        Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    }
}

use axum::response::Response;
