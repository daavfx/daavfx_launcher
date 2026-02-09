//! Monte Carlo Batch Optimizer
//! Parallel parameter sweeps with statistical analysis

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Parameter range for optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterRange {
    pub name: String,
    pub min: f64,
    pub max: f64,
    pub step: f64,
    #[serde(default)]
    pub is_integer: bool,
}

/// Single optimization result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationResult {
    pub params: HashMap<String, f64>,
    pub profit: f64,
    pub profit_factor: f64,
    pub max_drawdown: f64,
    pub win_rate: f64,
    pub sharpe_ratio: f64,
    pub trades: usize,
    pub score: f64,
}

/// Monte Carlo statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloStats {
    pub runs: usize,
    pub mean_profit: f64,
    pub std_dev: f64,
    pub worst_case: f64,   // 5th percentile
    pub best_case: f64,    // 95th percentile
    pub median: f64,
    pub confidence_95_low: f64,
    pub confidence_95_high: f64,
}

/// Optimization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    pub parameters: Vec<ParameterRange>,
    pub monte_carlo_runs: usize,
    pub parallel_workers: usize,
    pub setfile_path: String,
    pub ticks_path: String,
    pub objective: OptimizationObjective,
}

/// Optimization objective
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OptimizationObjective {
    MaxProfit,
    MaxProfitFactor,
    MinDrawdown,
    MaxSharpe,
    MaxWinRate,
    Custom { weights: HashMap<String, f64> },
}

/// Monte Carlo optimizer
pub struct MonteCarloOptimizer {
    config: OptimizationConfig,
    results: Arc<Mutex<Vec<OptimizationResult>>>,
    progress: Arc<Mutex<f64>>,
    is_running: Arc<Mutex<bool>>,
}

impl MonteCarloOptimizer {
    pub fn new(config: OptimizationConfig) -> Self {
        Self {
            config,
            results: Arc::new(Mutex::new(Vec::new())),
            progress: Arc::new(Mutex::new(0.0)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }
    
    /// Generate all parameter combinations
    pub fn generate_combinations(&self) -> Vec<HashMap<String, f64>> {
        let mut combinations = vec![HashMap::new()];
        
        for param in &self.config.parameters {
            let mut new_combinations = Vec::new();
            
            let mut val = param.min;
            while val <= param.max + 1e-9 {
                let v = if param.is_integer { val.round() } else { val };
                
                for combo in &combinations {
                    let mut new_combo = combo.clone();
                    new_combo.insert(param.name.clone(), v);
                    new_combinations.push(new_combo);
                }
                
                val += param.step;
            }
            
            combinations = new_combinations;
        }
        
        combinations
    }
    
    /// Run optimization (synchronous for simplicity)
    pub fn run_sync(&self) -> Vec<OptimizationResult> {
        let combinations = self.generate_combinations();
        let total = combinations.len();
        let mut results = Vec::new();
        
        for (i, params) in combinations.iter().enumerate() {
            // Simulate backtest result (replace with actual backtest call)
            let result = self.simulate_backtest(params.clone());
            results.push(result);
            
            // Update progress
            if let Ok(mut p) = self.progress.lock() {
                *p = (i as f64 + 1.0) / total as f64;
            }
        }
        
        // Sort by objective
        self.sort_results(&mut results);
        
        results
    }
    
    /// Run Monte Carlo simulation on top-N results
    pub fn run_monte_carlo(&self, base_params: &HashMap<String, f64>) -> MonteCarloStats {
        let runs = self.config.monte_carlo_runs;
        let mut profits: Vec<f64> = Vec::with_capacity(runs);
        
        for _i in 0..runs {
            // Add random perturbation to trade sequence (shuffle effect)
            let result = self.simulate_backtest_with_variance(base_params.clone());
            profits.push(result.profit);
        }
        
        // Sort for percentiles
        profits.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        
        let mean = profits.iter().sum::<f64>() / runs as f64;
        let variance = profits.iter().map(|p| (p - mean).powi(2)).sum::<f64>() / runs as f64;
        let std_dev = variance.sqrt();
        
        let idx_5 = (runs as f64 * 0.05) as usize;
        let idx_50 = (runs as f64 * 0.50) as usize;
        let idx_95 = (runs as f64 * 0.95) as usize;
        
        MonteCarloStats {
            runs,
            mean_profit: mean,
            std_dev,
            worst_case: profits.get(idx_5).copied().unwrap_or(0.0),
            best_case: profits.get(idx_95).copied().unwrap_or(0.0),
            median: profits.get(idx_50).copied().unwrap_or(0.0),
            confidence_95_low: mean - 1.96 * std_dev,
            confidence_95_high: mean + 1.96 * std_dev,
        }
    }
    
    /// Simulate backtest (placeholder - wire to actual engine)
    fn simulate_backtest(&self, params: HashMap<String, f64>) -> OptimizationResult {
        // Placeholder: Generate semi-random results based on params
        let seed = params.values().fold(0.0, |acc, v| acc + v * 1000.0) as u64;
        let pseudo_rand = |n: u64| -> f64 { ((n * 1103515245 + 12345) % 2147483648) as f64 / 2147483648.0 };
        
        let r1 = pseudo_rand(seed);
        let r2 = pseudo_rand(seed.wrapping_add(1));
        let r3 = pseudo_rand(seed.wrapping_add(2));
        
        let profit = (r1 - 0.3) * 10000.0;
        let profit_factor = 0.5 + r2 * 2.5;
        let max_drawdown = 5.0 + r3 * 30.0;
        let win_rate = 30.0 + r1 * 40.0;
        let trades = (50.0 + r2 * 200.0) as usize;
        let sharpe = (profit_factor - 1.0) / (max_drawdown / 100.0).max(0.1);
        
        let score = self.calculate_score(profit, profit_factor, max_drawdown, win_rate, sharpe);
        
        OptimizationResult {
            params,
            profit,
            profit_factor,
            max_drawdown,
            win_rate,
            sharpe_ratio: sharpe,
            trades,
            score,
        }
    }
    
    /// Simulate backtest with variance for Monte Carlo
    fn simulate_backtest_with_variance(&self, params: HashMap<String, f64>) -> OptimizationResult {
        let mut result = self.simulate_backtest(params);
        
        // Add random variance (simulate trade shuffling)
        let variance = (std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos() % 1000) as f64 / 1000.0;
        
        result.profit *= 0.8 + variance * 0.4;
        result
    }
    
    /// Calculate optimization score based on objective
    fn calculate_score(&self, profit: f64, pf: f64, dd: f64, wr: f64, sharpe: f64) -> f64 {
        match &self.config.objective {
            OptimizationObjective::MaxProfit => profit,
            OptimizationObjective::MaxProfitFactor => pf,
            OptimizationObjective::MinDrawdown => -dd,
            OptimizationObjective::MaxSharpe => sharpe,
            OptimizationObjective::MaxWinRate => wr,
            OptimizationObjective::Custom { weights } => {
                let mut score = 0.0;
                if let Some(w) = weights.get("profit") { score += profit * w; }
                if let Some(w) = weights.get("profit_factor") { score += pf * w; }
                if let Some(w) = weights.get("max_drawdown") { score -= dd * w; }
                if let Some(w) = weights.get("win_rate") { score += wr * w; }
                if let Some(w) = weights.get("sharpe") { score += sharpe * w; }
                score
            }
        }
    }
    
    /// Sort results by score descending
    fn sort_results(&self, results: &mut [OptimizationResult]) {
        results.sort_by(|a, b| {
            b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal)
        });
    }
    
    pub fn get_progress(&self) -> f64 {
        *self.progress.lock().unwrap_or_else(|e| e.into_inner())
    }
    
    pub fn is_running(&self) -> bool {
        *self.is_running.lock().unwrap_or_else(|e| e.into_inner())
    }
}

// ============ Tauri Commands ============

#[cfg(feature = "tauri")]
use tauri::command;

/// Start optimization run
#[cfg(feature = "tauri")]
#[command]
pub async fn start_optimization(config: OptimizationConfig) -> Result<Vec<OptimizationResult>, String> {
    let optimizer = MonteCarloOptimizer::new(config);
    let results = optimizer.run_sync();
    Ok(results)
}

/// Run Monte Carlo analysis on specific parameters
#[cfg(feature = "tauri")]
#[command]
pub async fn run_monte_carlo_analysis(
    config: OptimizationConfig,
    params: HashMap<String, f64>,
) -> Result<MonteCarloStats, String> {
    let optimizer = MonteCarloOptimizer::new(config);
    let stats = optimizer.run_monte_carlo(&params);
    Ok(stats)
}

// ============ Tests ============

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_generate_combinations() {
        let config = OptimizationConfig {
            parameters: vec![
                ParameterRange {
                    name: "lots".into(),
                    min: 0.01,
                    max: 0.03,
                    step: 0.01,
                    is_integer: false,
                },
                ParameterRange {
                    name: "sl".into(),
                    min: 10.0,
                    max: 30.0,
                    step: 10.0,
                    is_integer: true,
                },
            ],
            monte_carlo_runs: 100,
            parallel_workers: 4,
            setfile_path: String::new(),
            ticks_path: String::new(),
            objective: OptimizationObjective::MaxProfit,
        };
        
        let optimizer = MonteCarloOptimizer::new(config);
        let combos = optimizer.generate_combinations();
        
        // 3 lots * 3 sl = 9 combinations
        assert_eq!(combos.len(), 9);
    }
    
    #[test]
    fn test_monte_carlo_stats() {
        let config = OptimizationConfig {
            parameters: vec![],
            monte_carlo_runs: 100,
            parallel_workers: 4,
            setfile_path: String::new(),
            ticks_path: String::new(),
            objective: OptimizationObjective::MaxProfit,
        };
        
        let optimizer = MonteCarloOptimizer::new(config);
        let mut params = HashMap::new();
        params.insert("test".into(), 1.0);
        
        let stats = optimizer.run_monte_carlo(&params);
        
        assert_eq!(stats.runs, 100);
        assert!(stats.confidence_95_low < stats.mean_profit);
        assert!(stats.mean_profit < stats.confidence_95_high);
    }
}
