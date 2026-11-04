/* charts.js - Chart.js visualizations for IndiaStockLens (no ML logic here) */
(() => {
  "use strict";

  const C = { ink: "#111111", sky: "#0ea5e9", skyLight: "#7dd3fc", grid: "#e3edf3", muted: "#5f6b76", up: "#15803d" };
  const registry = {};

  function destroy(id) {
    if (registry[id]) { registry[id].destroy(); delete registry[id]; }
  }

  function make(id, config) {
    destroy(id);
    const el = document.getElementById(id);
    if (!el || typeof Chart === "undefined") return null;
    registry[id] = new Chart(el, config);
    return registry[id];
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: { legend: { labels: { boxWidth: 12, color: C.muted } } }
  };

  /* history: [{date, close}], predictedPrice: number | null */
  function priceChart(history, predictedPrice) {
    const rows = history.slice(-90);
    const labels = rows.map(r => r.date);
    const closes = rows.map(r => r.close);
    const hasForecast = typeof predictedPrice === "number";
    const datasets = [{
      label: "Close (INR)", data: hasForecast ? closes.concat([null]) : closes,
      borderColor: C.ink, backgroundColor: C.ink, borderWidth: 2, pointRadius: 0, tension: 0.2
    }];
    if (hasForecast) {
      labels.push("Next trading day");
      const f = closes.map(() => null);
      f[f.length - 1] = closes[closes.length - 1];
      f.push(predictedPrice);
      datasets.push({
        label: "Predicted (INR)", data: f, borderColor: C.sky, backgroundColor: C.sky,
        borderDash: [6, 4], borderWidth: 2, pointRadius: (ctx) => ctx.dataIndex === f.length - 1 ? 5 : 0
      });
    }
    return make("price-chart", {
      type: "line",
      data: { labels, datasets },
      options: {
        ...baseOptions,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { ticks: { maxTicksLimit: 8, color: C.muted }, grid: { display: false } },
          y: { ticks: { color: C.muted, callback: v => "₹" + Number(v).toLocaleString("en-IN") }, grid: { color: C.grid } }
        }
      }
    });
  }

  /* items: [{feature, importance}], labelFn: feature -> readable name */
  function importanceChart(items, labelFn) {
    const top = items.slice().sort((a, b) => b.importance - a.importance).slice(0, 10);
    return make("importance-chart", {
      type: "bar",
      data: {
        labels: top.map(i => labelFn(i.feature)),
        datasets: [{ label: "Importance", data: top.map(i => i.importance), backgroundColor: C.sky, borderRadius: 3 }]
      },
      options: {
        ...baseOptions,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: C.muted }, grid: { color: C.grid }, beginAtZero: true },
          y: { ticks: { color: C.ink }, grid: { display: false } }
        }
      }
    });
  }

  /* rows: [{model, window_days, direction_accuracy}] */
  function modelChart(rows) {
    const windows = [...new Set(rows.map(r => r.window_days))].sort((a, b) => a - b);
    const models = [...new Set(rows.map(r => r.model))];
    const colors = [C.ink, C.sky, C.skyLight, "#8fb8d3"];
    const toPct = v => (v == null ? null : (v <= 1 ? v * 100 : v));
    return make("model-chart", {
      type: "bar",
      data: {
        labels: windows.map(w => w + " days"),
        datasets: models.map((m, i) => ({
          label: m,
          backgroundColor: colors[i % colors.length],
          borderRadius: 3,
          data: windows.map(w => {
            const r = rows.find(x => x.model === m && x.window_days === w);
            return r ? toPct(r.direction_accuracy) : null;
          })
        }))
      },
      options: {
        ...baseOptions,
        scales: {
          x: { ticks: { color: C.muted }, grid: { display: false } },
          y: { title: { display: true, text: "Direction accuracy (%)", color: C.muted }, ticks: { color: C.muted }, grid: { color: C.grid }, beginAtZero: true }
        }
      }
    });
  }

  window.Charts = { priceChart, importanceChart, modelChart, destroy };
})();
