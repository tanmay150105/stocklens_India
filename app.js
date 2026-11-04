/* app.js - IndiaStockLens dashboard. Only calls the Flask API and displays results.
 *
 * Endpoints used:
 *   GET /api/v1/predict?symbol=TCS.NS&window=60   (contract defined in README section 24)
 *   GET /api/v1/stocks            ASSUMED: {status, stocks:[{symbol, name, sector}]}
 *   GET /api/v1/stock/<symbol>    ASSUMED: {status, history:[{date, close}], indicators:{rsi_14,...},
 *                                           nifty:{return,volatility,trend}, sector:{name,return,volatility,trend}}
 *   GET /api/v1/metrics/<symbol>  ASSUMED: {status, models:[{model, window_days, mae, rmse, r2,
 *                                           direction_accuracy, f1, training_time_ms, prediction_time_ms}]}
 * Errors: any non-2xx response, or {status:"error", message}, is shown in the error banner.
 * Add ?mock=1 to the URL to develop without the backend.
 */
(() => {
  "use strict";

  const API_BASE = "/api/v1";
  const params = new URLSearchParams(location.search);
  const MOCK = params.has("mock");

  const DEFAULT_STOCKS = [
    ["HDFCBANK.NS", "Banking"], ["ICICIBANK.NS", "Banking"], ["SBIN.NS", "Banking"], ["AXISBANK.NS", "Banking"],
    ["TCS.NS", "Information Technology"], ["INFY.NS", "Information Technology"], ["WIPRO.NS", "Information Technology"], ["HCLTECH.NS", "Information Technology"],
    ["RELIANCE.NS", "Energy"], ["ONGC.NS", "Energy"],
    ["MARUTI.NS", "Automobile"], ["M&M.NS", "Automobile"], ["TATAMOTORS.NS", "Automobile"],
    ["ITC.NS", "FMCG"], ["HINDUNILVR.NS", "FMCG"],
    ["SUNPHARMA.NS", "Pharmaceutical"], ["CIPLA.NS", "Pharmaceutical"],
    ["BHARTIARTL.NS", "Other"], ["LT.NS", "Other"], ["ADANIPORTS.NS", "Other"]
  ].map(([symbol, sector]) => ({ symbol, sector }));

  const FEATURE_LABELS = {
    close_lag_1: "Close (1 day ago)", close_lag_2: "Close (2 days ago)", close_lag_3: "Close (3 days ago)",
    close_lag_5: "Close (5 days ago)", close_lag_10: "Close (10 days ago)",
    return_daily: "Daily return", return_5d: "5-day return", return_20d: "20-day return",
    sma_10: "SMA 10", sma_20: "SMA 20", sma_50: "SMA 50", ema_10: "EMA 10", ema_20: "EMA 20",
    rsi_14: "RSI (14)", macd_diff: "MACD difference", rolling_volatility: "Rolling volatility", atr: "ATR",
    bollinger_upper: "Bollinger upper", bollinger_lower: "Bollinger lower",
    nifty_return: "NIFTY return", nifty_volatility: "NIFTY volatility", nifty_trend: "NIFTY trend",
    sector_return: "Sector return", sector_volatility: "Sector volatility", sector_trend: "Sector trend"
  };

  // [key, label, format]
  const INDICATORS = [
    ["rsi_14", "RSI (14)", "num"], ["macd_diff", "MACD difference", "num"],
    ["sma_10", "SMA 10", "inr"], ["sma_20", "SMA 20", "inr"], ["sma_50", "SMA 50", "inr"],
    ["ema_10", "EMA 10", "inr"], ["ema_20", "EMA 20", "inr"],
    ["bollinger_upper", "Bollinger upper", "inr"], ["bollinger_lower", "Bollinger lower", "inr"],
    ["atr", "ATR", "num"], ["rolling_volatility", "Rolling volatility", "pct"]
  ];

  const state = { symbol: params.get("symbol") || "TCS.NS", windowDays: 60, token: 0 };
  const $ = (id) => document.getElementById(id);

  /* ---------- formatting ---------- */
  const isNum = (v) => typeof v === "number" && isFinite(v);
  const inr = (v) => isNum(v) ? "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--";
  const num = (v, d = 2) => isNum(v) ? v.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }) : "--";
  const pct = (v, d = 2, signed = false) => isNum(v) ? (signed && v > 0 ? "+" : "") + (v * 100).toFixed(d) + "%" : "--";
  const label = (f) => FEATURE_LABELS[f] || f.replace(/_/g, " ");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (v, type) => type === "inr" ? inr(v) : type === "pct" ? pct(v) : num(v);

  /* ---------- API ---------- */
  async function api(path) {
    if (MOCK) return mockApi(path);
    let res;
    try { res = await fetch(API_BASE + path, { headers: { Accept: "application/json" } }); }
    catch { throw new Error("Cannot reach the server. Check that the Flask app is running."); }
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON response */ }
    if (!res.ok || (body && body.status === "error")) {
      throw new Error((body && (body.message || body.reason)) || `Request failed (HTTP ${res.status}).`);
    }
    if (!body) throw new Error("The server returned an unreadable response.");
    return body;
  }

  /* ---------- rendering ---------- */
  function setText(id, text, cls) {
    const el = $(id);
    el.textContent = text;
    el.classList.remove("up", "down", "warn");
    if (cls) el.classList.add(cls);
  }

  function setNote(id, text) {
    const el = $(id);
    el.textContent = text || "";
    el.hidden = !text;
  }

  function showError(msg) { const b = $("error-box"); b.textContent = msg; b.hidden = false; }
  function hideError() { $("error-box").hidden = true; }

  function clearKpis() {
    ["current-price", "predicted-price", "expected-return", "direction", "risk", "reliability", "regime"].forEach(id => setText(id, "--"));
    $("reliability-bar").style.width = "0";
  }

  function renderStatus(p) {
    const el = $("data-status");
    const s = p && p.data_status;
    el.className = "badge " + (s === "FRESH" ? "fresh" : s === "CACHED" ? "cached" : "neutral");
    el.textContent = "DATA: " + (s || "--");
    el.title = s === "CACHED" ? "Latest data could not be fetched; using locally cached data." : s === "FRESH" ? "Latest data from the provider." : "Data status unavailable.";
    $("timestamp").textContent = "Last updated: " + ((p && p.timestamp) || "--");
  }

  function renderPrediction(r) {
    if (r.status === "rejected") {
      clearKpis(); renderStatus(null); Charts.destroy("importance-chart");
      showError(r.reason.message);
      setNote("importance-note", "Explanation unavailable.");
      return null;
    }
    const p = r.value;
    renderStatus(p);
    setText("current-price", inr(p.current_price));
    setText("predicted-price", inr(p.predicted_price));
    setText("expected-return", pct(p.predicted_return, 2, true), p.predicted_return > 0 ? "up" : p.predicted_return < 0 ? "down" : "");
    setText("direction", p.direction === "UP" ? "▲ UP" : p.direction === "DOWN" ? "▼ DOWN" : "--", p.direction === "UP" ? "up" : p.direction === "DOWN" ? "down" : "");
    setText("risk", p.risk_level || "--", p.risk_level === "LOW" ? "up" : p.risk_level === "HIGH" ? "down" : p.risk_level === "MEDIUM" ? "warn" : "");
    setText("reliability", isNum(p.reliability_score) ? Math.round(p.reliability_score * 100) + "%" : "--");
    $("reliability-bar").style.width = isNum(p.reliability_score) ? Math.round(p.reliability_score * 100) + "%" : "0";
    setText("regime", p.market_regime || "--");

    if (Array.isArray(p.feature_importance) && p.feature_importance.length) {
      setNote("importance-note", "");
      Charts.importanceChart(p.feature_importance, label);
    } else {
      Charts.destroy("importance-chart");
      setNote("importance-note", "Feature importance is not available for this prediction.");
    }
    return p;
  }

  function renderDetail(r, pred) {
    const ind = $("indicators-body"), ctx = $("context-body");
    if (r.status === "rejected") {
      Charts.destroy("price-chart");
      setNote("price-note", "Price history unavailable: " + r.reason.message);
      ind.innerHTML = '<tr><td colspan="2" class="empty">Indicators unavailable.</td></tr>';
      ctx.innerHTML = '<tr><td colspan="4" class="empty">Context unavailable.</td></tr>';
      return;
    }
    const d = r.value;
    if (Array.isArray(d.history) && d.history.length) {
      setNote("price-note", "");
      Charts.priceChart(d.history, pred ? pred.predicted_price : null);
    } else {
      Charts.destroy("price-chart");
      setNote("price-note", "No price history available for this stock.");
    }

    const rows = INDICATORS.filter(([k]) => d.indicators && isNum(d.indicators[k]));
    ind.innerHTML = rows.length
      ? rows.map(([k, l, t]) => `<tr><td>${esc(l)}</td><td>${esc(fmt(d.indicators[k], t))}</td></tr>`).join("")
      : '<tr><td colspan="2" class="empty">No indicator values returned.</td></tr>';

    const line = (name, c) => c
      ? `<tr><td>${esc(name)}</td><td>${pct(c.return, 2, true)}</td><td>${pct(c.volatility)}</td><td>${isNum(c.trend) ? num(c.trend, 4) : "--"}</td></tr>`
      : "";
    const html = line("NIFTY 50", d.nifty) + line(d.sector && d.sector.name ? d.sector.name + " sector" : "Sector", d.sector);
    ctx.innerHTML = html || '<tr><td colspan="4" class="empty">No context values returned.</td></tr>';
  }

  function renderMetrics(r) {
    const body = $("models-body");
    if (r.status === "rejected" || !Array.isArray(r.value.models) || !r.value.models.length) {
      Charts.destroy("model-chart");
      body.innerHTML = '<tr><td colspan="9" class="empty">No model comparison available.</td></tr>';
      setNote("models-note", r.status === "rejected" ? r.reason.message : "");
      return;
    }
    setNote("models-note", "");
    const rows = r.value.models.slice().sort((a, b) => a.window_days - b.window_days || String(a.model).localeCompare(b.model));
    body.innerHTML = rows.map(m => `<tr class="${m.window_days === state.windowDays ? "current" : ""}">
      <td>${esc(m.model)}</td><td>${esc(m.window_days)}d</td><td>${num(m.mae, 4)}</td><td>${num(m.rmse, 4)}</td><td>${num(m.r2, 3)}</td>
      <td>${isNum(m.direction_accuracy) ? (m.direction_accuracy <= 1 ? pct(m.direction_accuracy, 1) : num(m.direction_accuracy, 1) + "%") : "--"}</td>
      <td>${num(m.f1, 3)}</td><td>${num(m.training_time_ms, 0)}</td><td>${num(m.prediction_time_ms, 1)}</td></tr>`).join("");
    Charts.modelChart(rows);
  }

  /* ---------- flow ---------- */
  async function refresh() {
    const token = ++state.token;
    hideError();
    ["indicators-body", "context-body", "models-body"].forEach(id => {
      $(id).innerHTML = '<tr><td colspan="9" class="empty">Loading…</td></tr>';
    });
    const sym = encodeURIComponent(state.symbol);
    const [p, d, m] = await Promise.allSettled([
      api(`/predict?symbol=${sym}&window=${state.windowDays}`),
      api(`/stock/${sym}`),
      api(`/metrics/${sym}`)
    ]);
    if (token !== state.token) return; // a newer request replaced this one
    const pred = renderPrediction(p);
    renderDetail(d, pred);
    renderMetrics(m);
  }

  async function loadStocks() {
    let list = DEFAULT_STOCKS;
    try {
      const r = await api("/stocks");
      if (Array.isArray(r.stocks) && r.stocks.length) list = r.stocks;
    } catch { /* fall back to the README stock universe */ }

    const groups = {};
    list.forEach(s => { (groups[s.sector || "Stocks"] = groups[s.sector || "Stocks"] || []).push(s); });
    const sel = $("stock-select");
    sel.innerHTML = Object.entries(groups).map(([sector, items]) =>
      `<optgroup label="${esc(sector)}">${items.map(s =>
        `<option value="${esc(s.symbol)}">${esc(s.symbol)}${s.name ? " - " + esc(s.name) : ""}</option>`).join("")}</optgroup>`).join("");
    if (![...sel.options].some(o => o.value === state.symbol)) state.symbol = sel.options[0].value;
    sel.value = state.symbol;
  }

  function bind() {
    $("stock-select").addEventListener("change", e => { state.symbol = e.target.value; refresh(); });
    $("window-group").addEventListener("click", e => {
      const b = e.target.closest("button[data-window]");
      if (!b) return;
      state.windowDays = Number(b.dataset.window);
      document.querySelectorAll("#window-group button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      refresh();
    });
  }

  /* ---------- mock data (development only, ?mock=1) ---------- */
  function rng(seed) { // mulberry32
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  function mockApi(path) {
    return new Promise((resolve, reject) => setTimeout(() => {
      const url = new URL(path, "http://x");
      const parts = url.pathname.split("/").filter(Boolean);
      const sym = decodeURIComponent(parts[1] || url.searchParams.get("symbol") || "TCS.NS");
      const r = rng(hash(sym));
      const base = 400 + r() * 3600;
      if (parts[0] === "stocks") return resolve({ status: "success", stocks: DEFAULT_STOCKS });
      if (parts[0] === "predict") {
        const ret = (r() - 0.45) * 0.02, w = Number(url.searchParams.get("window"));
        return resolve({
          status: "success", symbol: sym, window_days: w, current_price: base, predicted_return: ret,
          predicted_price: base * (1 + ret), direction: ret > 0 ? "UP" : "DOWN",
          market_regime: ["Bullish", "Bearish", "Sideways", "High Volatility"][Math.floor(r() * 4)],
          risk_level: ["LOW", "MEDIUM", "HIGH"][Math.floor(r() * 3)], reliability_score: 0.6 + r() * 0.3,
          feature_importance: ["nifty_trend", "return_20d", "macd_diff", "rsi_14", "rolling_volatility", "sector_return"]
            .map((f, i) => ({ feature: f, importance: +(0.3 - i * 0.04 + r() * 0.02).toFixed(3) })),
          data_status: "FRESH", timestamp: new Date().toISOString().slice(0, 19).replace("T", " ")
        });
      }
      if (parts[0] === "stock") {
        let p = base; const history = [];
        for (let i = 120; i > 0; i--) { p *= 1 + (r() - 0.48) * 0.02; const dt = new Date(Date.now() - i * 864e5); history.push({ date: dt.toISOString().slice(0, 10), close: +p.toFixed(2) }); }
        return resolve({ status: "success", history,
          indicators: { rsi_14: 40 + r() * 30, macd_diff: (r() - 0.5) * 10, sma_10: p * 0.99, sma_20: p * 0.98, sma_50: p * 0.96, ema_10: p * 0.99, ema_20: p * 0.98,
            bollinger_upper: p * 1.04, bollinger_lower: p * 0.95, atr: p * 0.015, rolling_volatility: 0.01 + r() * 0.01 },
          nifty: { return: (r() - 0.5) * 0.01, volatility: 0.008 + r() * 0.006, trend: (r() - 0.5) * 0.02 },
          sector: { name: "Sector", return: (r() - 0.5) * 0.012, volatility: 0.009 + r() * 0.008, trend: (r() - 0.5) * 0.02 } });
      }
      if (parts[0] === "metrics") {
        const models = [];
        [30, 60, 90].forEach(w => ["Linear Regression", "Random Forest", "XGBoost"].forEach((m, i) =>
          models.push({ model: m, window_days: w, mae: 0.008 + r() * 0.004, rmse: 0.011 + r() * 0.005, r2: -0.05 + r() * 0.15,
            direction_accuracy: 0.48 + r() * 0.12, f1: 0.45 + r() * 0.15, training_time_ms: (i + 1) * w * (2 + r() * 3), prediction_time_ms: 1 + r() * 4 })));
        return resolve({ status: "success", models });
      }
      reject(new Error("Mock endpoint not found."));
    }, 150));
  }

  /* ---------- start ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    $("demo-banner").hidden = !MOCK;
    bind();
    await loadStocks();
    refresh();
  });
})();
