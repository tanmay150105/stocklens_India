const features = [
  ["🧠","AI-Powered Predictions","Linear Regression, Random Forest and XGBoost models forecast next-day return, closing price and direction using recent market data."],
  ["📊","Technical Analysis","Rolling volatility, MACD, ATR and moving averages, combined with NIFTY 50 and sector-level context."],
  ["🤖","AI Stock Advisor","Chat with an intelligent assistant to get explanations of predictions and market insights for NSE stocks."],
  ["🎯","Precise Targeting","Clear buy, sell or hold signals with target prices in ₹ and confidence levels for better portfolio decisions."],
  ["🛡️","Risk Assessment","Model-based Low, Medium and High risk levels, with a regime-based reliability score for every forecast."],
  ["⚡","Real-time Insights","Stay updated with the latest trend changes, news analysis and stock performance metrics."]
];

// Illustrative sample data in INR (replace with API response)
const stocks = [
  {s:"RELIANCE.NS", n:"Reliance Industries", rec:"BUY",  price:2945.60, target:3180, conf:88, chg:34.20,  pct:1.17,  risk:"Low"},
  {s:"TCS.NS",      n:"Tata Consultancy",    rec:"HOLD", price:3890.25, target:3950, conf:74, chg:-21.40, pct:-0.55, risk:"Low"},
  {s:"HDFCBANK.NS", n:"HDFC Bank",           rec:"BUY",  price:1672.40, target:1790, conf:91, chg:18.75,  pct:1.13,  risk:"Medium"},
  {s:"INFY.NS",     n:"Infosys",             rec:"BUY",  price:1545.80, target:1660, conf:84, chg:12.30,  pct:0.80,  risk:"Medium"},
  {s:"TATAMOTORS.NS",n:"Tata Motors",        rec:"SELL", price:985.30,  target:920,  conf:77, chg:-14.90, pct:-1.49, risk:"High"}
];

const inr = v => "₹" + v.toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});

document.getElementById("features").innerHTML = features.map(([i,t,d]) =>
  `<div class="card"><div class="ico">${i}</div><h3>${t}</h3><p>${d}</p></div>`).join("");

document.getElementById("preds").innerHTML = stocks.map(p => {
  const up = p.chg >= 0, sign = up ? "+" : "-";
  return `<div class="pred">
    <div class="pred-top"><div><h3>${p.s}</h3><small>${p.n}</small></div><span class="tag ${p.rec}">${p.rec}</span></div>
    <div class="row">Current Price <b>${inr(p.price)}</b></div>
    <div class="row">Target Price <b>${inr(p.target)}</b></div>
    <div class="row">Confidence <b>${p.conf}%</b></div>
    <div class="row">Risk Level <b class="risk-${p.risk}">${p.risk}</b></div>
    <div class="row">Change <b class="${up ? "up" : "down"}">${sign}${inr(Math.abs(p.chg))} (${sign}${Math.abs(p.pct)}%)</b></div>
    <div class="bar"><span style="width:${p.conf}%"></span></div>
  </div>`;
}).join("");

// Mobile menu
const nav = document.getElementById("nav");
document.getElementById("menu").onclick = () => nav.classList.toggle("open");

// Chat widget (replace the canned reply with a fetch() to your Flask backend)
const chat = document.getElementById("chat"), msgs = document.getElementById("msgs");
document.getElementById("chat-toggle").onclick = () => chat.classList.toggle("open");
document.getElementById("chat-form").onsubmit = e => {
  e.preventDefault();
  const q = document.getElementById("q");
  if (!q.value.trim()) return;
  add(q.value, "me");
  q.value = "";
  setTimeout(() => add("Connect this widget to your Flask backend for real answers.", "bot"), 500);
};
function add(text, who){
  const d = document.createElement("div");
  d.className = "m " + who;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}
