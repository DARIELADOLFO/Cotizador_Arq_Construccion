// ==========================================
// CONSTRUCTIQ — APP.JS
// ==========================================

let chartDonut = null, chartBars = null, chartLinea = null, chartRadar = null;

const PHASE_COLORS = ['#1db87a','#6c8ff5','#f59e4a','#f06292','#ab87f5','#38bdf8','#fb923c'];

const FASES_BASE = [
    { nombre: 'Fase 1 — Preliminares', short: 'Preliminares', pct_mat: 0.025, pct_mo: 0.040, dur_pct: 0.07  },
    { nombre: 'Fase 2 — Estructura',   short: 'Estructura',   pct_mat: 0.180, pct_mo: 0.100, dur_pct: 0.24  },
    { nombre: 'Fase 3 — Albañilería',  short: 'Albañilería',  pct_mat: 0.130, pct_mo: 0.120, dur_pct: 0.20  },
    { nombre: 'Fase 4 — Terminaciones',short: 'Terminaciones',pct_mat: 0.150, pct_mo: 0.080, dur_pct: 0.18  },
    { nombre: 'Fase 5 — Carpintería',  short: 'Carpintería',  pct_mat: 0.120, pct_mo: 0.050, dur_pct: 0.14  },
    { nombre: 'Fase 6 — Eléctrica',    short: 'Eléctrica',    pct_mat: 0.040, pct_mo: 0.030, dur_pct: 0.10  },
    { nombre: 'Fase 7 — Sanitaria',    short: 'Sanitaria',    pct_mat: 0.050, pct_mo: 0.040, dur_pct: 0.12  }
];

// Solapamiento entre fases (inicio como % del total)
const FASE_STARTS = [0, 0.07, 0.27, 0.38, 0.48, 0.53, 0.55];

// ==========================================
// INIT
// ==========================================
window.onload = function () {
    // Fecha de hoy por defecto
    const hoy = new Date();
    document.getElementById('fechaInicio').value = fmt(hoy);
    calcularProyecto();
};

// ==========================================
// SELECT CALIDAD
// ==========================================
function selectCalidad(btn) {
    document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('calidad').value = btn.dataset.value;
    calcularProyecto();
}

// ==========================================
// CALCULAR
// ==========================================
function calcularProyecto() {
    const metros         = parseFloat(document.getElementById('metros').value)        || 0;
    const habitaciones   = parseInt(document.getElementById('habitaciones').value)    || 0;
    const banos          = parseInt(document.getElementById('banos').value)           || 0;
    const niveles        = parseInt(document.getElementById('niveles').value)         || 1;
    const arquitectoPct  = parseFloat(document.getElementById('arquitecto').value)    || 0;
    const imprevPct      = parseFloat(document.getElementById('imprevistos').value)   || 0;
    const maestroDia     = parseFloat(document.getElementById('maestro').value)       || 0;
    const electricistaDia= parseFloat(document.getElementById('electricista').value)  || 0;
    const plomeroDia     = parseFloat(document.getElementById('plomero').value)       || 0;
    const carpinteroDia  = parseFloat(document.getElementById('carpintero').value)    || 0;
    const calidad        = document.getElementById('calidad').value;
    const nombreProyecto = document.getElementById('proyecto').value || 'Nuevo Proyecto';
    const fechaInicioStr = document.getElementById('fechaInicio').value;

    // Fecha inicio
    const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00') : new Date();

    // Costo m²
    const costoM2Map   = { economico:18000, medio:25000, premium:35000, lujo:50000 };
    const calidadLabel = { economico:'Económico', medio:'Calidad Media', premium:'Premium', lujo:'Lujo' };
    const costoMetro   = costoM2Map[calidad] || 25000;

    // Costo base
    const costoBase         = metros * costoMetro;
    const costoHabitaciones = habitaciones * 45000;
    const costoBanos        = banos * 85000;
    const costoNiveles      = Math.max(0, (niveles - 1)) * 300000;
    const subtotal          = costoBase + costoHabitaciones + costoBanos + costoNiveles;

    // Duración total
    const duracion = Math.round(metros * 0.45 + habitaciones * 6 + banos * 5 + niveles * 10 + 15);

    // Mano de obra profesionales
    const costoMaestro      = maestroDia      * duracion;
    const costoElectricista = electricistaDia * Math.round(duracion * 0.35);
    const costoPlomero      = plomeroDia      * Math.round(duracion * 0.30);
    const costoCarpin       = carpinteroDia   * Math.round(duracion * 0.40);
    const totalProf         = costoMaestro + costoElectricista + costoPlomero + costoCarpin;

    // Honorarios
    const costoArquitecto  = subtotal * (arquitectoPct / 100);
    const costoImprevistos = subtotal * (imprevPct / 100);

    // Total
    const total = subtotal + costoArquitecto + costoImprevistos + totalProf;

    // Riesgo
    let riesgo = 'Bajo', riesgoIcon = '🟢';
    if (total >= 2000000) { riesgo = 'Medio'; riesgoIcon = '🟡'; }
    if (total >= 4000000) { riesgo = 'Alto';  riesgoIcon = '🔴'; }

    // Por fase
    const matFase  = FASES_BASE.map(f => Math.round(subtotal * f.pct_mat));
    const moFase   = FASES_BASE.map(f => Math.round(subtotal * f.pct_mo));
    const totFase  = matFase.map((m, i) => m + moFase[i]);
    const maxFase  = Math.max(...totFase);

    // Flujo acumulado semanal
    const semanas = Math.ceil(duracion / 7);
    const flujo = [];
    for (let s = 0; s < semanas; s++) {
        const pct = (s + 1) / semanas;
        flujo.push(Math.round(total * Math.pow(pct, 0.7)));
    }

    // ---- UI ----
    document.getElementById('topbarTitle').textContent   = nombreProyecto;
    document.getElementById('calidadBadge').textContent  = calidadLabel[calidad] || 'Calidad Media';
    document.getElementById('riesgoIcon').textContent    = riesgoIcon;
    document.getElementById('riesgo').textContent        = riesgo;
    document.getElementById('costoM2').textContent       = metros > 0
        ? 'RD$ ' + Math.round(total / metros).toLocaleString('es-DO') : '—';
    document.getElementById('totalManoObra').textContent = 'RD$ ' + totalProf.toLocaleString('es-DO');
    document.getElementById('donutTotal').textContent    = 'RD$' + (total/1000000).toFixed(2)+'M';

    animateValue('costoTotal', total, v => 'RD$ ' + Math.round(v).toLocaleString('es-DO'));
    animateValue('duracion',   duracion, v => Math.round(v) + ' días');

    renderDonut(subtotal, costoArquitecto, costoImprevistos, totalProf);
    renderBars(totFase);
    renderLinea(flujo, semanas);
    renderRadar(costoMaestro, costoElectricista, costoPlomero, costoCarpin, costoArquitecto);
    renderBreakdown(matFase, moFase, totFase, maxFase);
    renderGantt(duracion, fechaInicio);
}

// ==========================================
// ANIMATE VALUE
// ==========================================
function animateValue(id, target, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    const dur = 700, t0 = performance.now();
    function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = formatter(target * ease);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ==========================================
// TOOLTIP DEFAULTS
// ==========================================
const tooltipDefaults = {
    backgroundColor: '#fff',
    borderColor: '#e4ece8',
    borderWidth: 1,
    titleColor: '#1a2d26',
    bodyColor: '#4d6b5e',
    padding: 12,
    cornerRadius: 10,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
};

// ==========================================
// DONUT
// ==========================================
function renderDonut(subtotal, arquitecto, imprevistos, profesionales) {
    if (chartDonut) { chartDonut.destroy(); chartDonut = null; }
    chartDonut = new Chart(document.getElementById('graficoCostos'), {
        type: 'doughnut',
        data: {
            labels: ['Obra Civil', 'Arquitecto', 'Imprevistos', 'Profesionales'],
            datasets: [{
                data: [subtotal, arquitecto, imprevistos, profesionales],
                backgroundColor: ['#1db87a','#6c8ff5','#f59e4a','#f06292'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 3,
            }]
        },
        options: {
            cutout: '66%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color:'#4d6b5e', font:{ family:'Inter', size:12 }, padding:14, usePointStyle:true }
                },
                tooltip: { ...tooltipDefaults, callbacks: { label: c => ' RD$ ' + c.parsed.toLocaleString('es-DO') } }
            },
            animation: { animateRotate: true, duration: 800 }
        }
    });
}

// ==========================================
// BARRAS
// ==========================================
function renderBars(totFase) {
    if (chartBars) { chartBars.destroy(); chartBars = null; }
    chartBars = new Chart(document.getElementById('graficoFases'), {
        type: 'bar',
        data: {
            labels: FASES_BASE.map(f => f.short),
            datasets: [{
                label: 'Costo Estimado',
                data: totFase,
                backgroundColor: PHASE_COLORS.map(c => c + 'cc'),
                borderColor: PHASE_COLORS,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { ...tooltipDefaults, callbacks: { label: c => ' RD$ ' + c.parsed.y.toLocaleString('es-DO') } }
            },
            scales: {
                x: { grid:{ color:'#f0f4f2' }, ticks:{ color:'#93b5a5', font:{ family:'Inter', size:11 } } },
                y: { beginAtZero:true, grid:{ color:'#f0f4f2' }, ticks:{
                    color:'#93b5a5', font:{ family:'Inter', size:11 },
                    callback: v => 'RD$'+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'K':v)
                }}
            },
            animation: { duration: 800 }
        }
    });
}

// ==========================================
// LÍNEA
// ==========================================
function renderLinea(flujo, semanas) {
    if (chartLinea) { chartLinea.destroy(); chartLinea = null; }
    chartLinea = new Chart(document.getElementById('graficoLinea'), {
        type: 'line',
        data: {
            labels: Array.from({ length: semanas }, (_, i) => 'Sem ' + (i + 1)),
            datasets: [{
                label: 'Inversión Acumulada',
                data: flujo,
                borderColor: '#1db87a',
                backgroundColor: 'rgba(29,184,122,0.08)',
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: '#1db87a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.45
            }]
        },
        options: {
            responsive:true, maintainAspectRatio:false,
            plugins: {
                legend: { display: false },
                tooltip: { ...tooltipDefaults, callbacks:{ label: c => ' RD$ '+c.parsed.y.toLocaleString('es-DO') } }
            },
            scales: {
                x: { grid:{ color:'#f0f4f2' }, ticks:{ color:'#93b5a5', font:{ family:'Inter', size:11 } } },
                y: { beginAtZero:true, grid:{ color:'#f0f4f2' }, ticks:{
                    color:'#93b5a5', font:{ family:'Inter', size:11 },
                    callback: v => 'RD$'+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'K':v)
                }}
            },
            animation: { duration: 800 }
        }
    });
}

// ==========================================
// POLAR AREA — PROFESIONALES
// ==========================================
function renderRadar(maestro, electricista, plomero, carpintero, arquitecto) {
    if (chartRadar) { chartRadar.destroy(); chartRadar = null; }
    chartRadar = new Chart(document.getElementById('graficoProfesionales'), {
        type: 'polarArea',
        data: {
            labels: ['Maestro', 'Electricista', 'Plomero', 'Carpintero', 'Arquitecto'],
            datasets: [{
                data: [maestro, electricista, plomero, carpintero, arquitecto],
                backgroundColor: ['rgba(29,184,122,0.5)','rgba(108,143,245,0.5)','rgba(245,158,74,0.5)','rgba(240,98,146,0.5)','rgba(171,135,245,0.5)'],
                borderColor: ['#1db87a','#6c8ff5','#f59e4a','#f06292','#ab87f5'],
                borderWidth: 2
            }]
        },
        options: {
            responsive:true, maintainAspectRatio:false,
            plugins: {
                legend: { position:'bottom', labels:{ color:'#4d6b5e', font:{ family:'Inter', size:11 }, padding:12, usePointStyle:true } },
                tooltip: { ...tooltipDefaults, callbacks:{ label: c => ' RD$ '+c.parsed.r.toLocaleString('es-DO') } }
            },
            scales: {
                r: {
                    grid: { color:'#e4ece8' },
                    ticks: { display:false },
                    pointLabels: { color:'#4d6b5e', font:{ family:'Inter', size:11 } }
                }
            },
            animation: { duration: 800 }
        }
    });
}

// ==========================================
// BREAKDOWN TABLE
// ==========================================
function renderBreakdown(mat, mo, totales, maxFase) {
    const grand = totales.reduce((a, b) => a + b, 0);
    let html = `<div class="breakdown-row header">
        <span>Fase</span><span>Materiales</span><span>Mano de Obra</span><span>Total</span><span>%</span>
    </div>`;
    FASES_BASE.forEach((fase, i) => {
        const pct = grand > 0 ? ((totales[i]/grand)*100).toFixed(1) : 0;
        const bw  = maxFase > 0 ? ((totales[i]/maxFase)*100).toFixed(1) : 0;
        const c   = PHASE_COLORS[i];
        html += `<div class="breakdown-row">
            <div class="br-fase"><div class="br-dot" style="background:${c}"></div><span>${fase.short}</span></div>
            <span class="br-value">RD$ ${mat[i].toLocaleString('es-DO')}</span>
            <span class="br-value">RD$ ${mo[i].toLocaleString('es-DO')}</span>
            <span class="br-value" style="color:${c};font-weight:700">RD$ ${totales[i].toLocaleString('es-DO')}</span>
            <div>
                <div class="br-bar-wrap"><div class="br-bar-fill" style="width:${bw}%;background:${c}"></div></div>
                <span class="br-pct" style="color:${c}">${pct}%</span>
            </div>
        </div>`;
    });
    document.getElementById('breakdownTable').innerHTML = html;
}

// ==========================================
// GANTT — con fecha de inicio real
// ==========================================
function renderGantt(duracion, fechaInicio) {
    document.getElementById('gantt').innerHTML = '';

    // Calcular fechas de cada fase usando solapamiento real
    const tareas = FASES_BASE.map((fase, i) => {
        const inicioRelativo = Math.round(FASE_STARTS[i] * duracion);
        const finRelativo    = Math.round((FASE_STARTS[i] + fase.dur_pct) * duracion);
        const finAjustado    = Math.max(finRelativo, inicioRelativo + 3); // mínimo 3 días

        const startDate = addDays(fechaInicio, inicioRelativo);
        const endDate   = addDays(fechaInicio, finAjustado);

        // Progreso simulado basado en cuánto de la fase ya pasó
        const hoy = new Date();
        let progress = 0;
        if (hoy >= endDate) progress = 100;
        else if (hoy > startDate) {
            progress = Math.round(((hoy - startDate) / (endDate - startDate)) * 100);
        }

        const iconos = ['🏗','🧱','🪵','🎨','🚪','⚡','🚿'];
        return {
            id: String(i + 1),
            name: iconos[i] + ' ' + fase.short,
            start: fmt(startDate),
            end: fmt(endDate),
            progress: progress
        };
    });

    // Rango en el badge
    const fechaFin = addDays(fechaInicio, duracion);
    document.getElementById('ganttRango').textContent =
        fmtDisplay(fechaInicio) + ' → ' + fmtDisplay(fechaFin) + ' (' + duracion + ' días)';

    try {
        new Gantt('#gantt', tareas, {
            view_mode: 'Week',
            language: 'es',
            date_format: 'YYYY-MM-DD',
            bar_height: 30,
            padding: 16,
            custom_popup_html: null
        });
    } catch(e) {
        console.warn('Gantt error:', e);
        // Fallback: tabla simple
        let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
        html += '<tr style="background:#f0f4f2"><th style="padding:8px;text-align:left;color:#4d6b5e">Fase</th><th style="padding:8px;color:#4d6b5e">Inicio</th><th style="padding:8px;color:#4d6b5e">Fin</th><th style="padding:8px;color:#4d6b5e">Días</th></tr>';
        tareas.forEach((t, i) => {
            html += `<tr style="border-top:1px solid #e4ece8">
                <td style="padding:8px;font-weight:600">${t.name}</td>
                <td style="padding:8px;color:#4d6b5e">${t.start}</td>
                <td style="padding:8px;color:#4d6b5e">${t.end}</td>
                <td style="padding:8px;color:${PHASE_COLORS[i]};font-weight:700">${Math.round(FASES_BASE[i].dur_pct * duracion)} días</td>
            </tr>`;
        });
        html += '</table>';
        document.getElementById('gantt').outerHTML = '<div id="gantt">' + html + '</div>';
    }
}

// ==========================================
// HELPERS
// ==========================================
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function fmt(date) {
    return date.toISOString().split('T')[0];
}
function fmtDisplay(date) {
    return date.toLocaleDateString('es-DO', { day:'2-digit', month:'short', year:'numeric' });
}