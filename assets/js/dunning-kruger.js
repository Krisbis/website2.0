(function(){
  var chartInstance = null;
  var mq = null;

  function getCssVar(name, fallback){
    try{ return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; }catch(e){ return fallback; }
  }
  function roundedRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
  function init(){
    var el = document.getElementById('dkChart');
    if(!el || typeof Chart === 'undefined') return;

    mq = mq || window.matchMedia('(max-width: 600px)');

    function render(){
      var isSmall = !!(mq && mq.matches);
      if(chartInstance){
        try{ chartInstance.destroy(); }catch(e){}
        chartInstance = null;
      }

      var accent = getCssVar('--accent', '#eef1f3');
      var gridColor = 'rgba(255,255,255,0.08)';
      var tickColor = '#9aa7b2';
      var curveColor = '#910000';

      // Reuse existing site palette (already used elsewhere in style.css)
      var cPeak = '#ff6b6b';      // term-error
      var cValley = '#f7d070';    // term-meta
      var cSlope = '#69d84f';     // ps1
      var cPlateau = '#4da6ff';   // term-dir

      var dataPoints = [
        {x: 0,  y: 0},
        {x: 8,  y: 86},  // peak of Mt. Stupid
        {x: 28, y: 24},  // valley of despair
        {x: 58, y: 60},  // slope of enlightenment
        {x: 88, y: 78},  // plateau start
        {x: 100,y: 80}   // plateau end
      ];

      var waypointDefs = [
        {x: 8,  y: 86, color: cPeak},
        {x: 28, y: 24, color: cValley},
        {x: 58, y: 60, color: cSlope},
        {x: 88, y: 78, color: cPlateau}
      ];

      // Clickable timeline notes for each waypoint.
      // Add/adjust the `story` text to match your own journey.
      var waypointNotes = [
        {
          x: 8,
          y: 86,
          title: 'peak of "Mt. Stupid"',
          story: 'Learnt to use msfconsole: "Hacking is easy"'
        },
        { x: 28, y: 24, title: 'valley of despair', story: '' },
        { x: 58, y: 60, title: 'slope of enlightenment', story: '' },
        { x: 88, y: 78, title: 'plateau of sustainability', story: '' }
      ];

      var labels = [
        {x:8, y:86, text:'peak of "Mt. Stupid"', dx:-10, dy:-12},
        {x:28,y:24, text:'valley of despair',    dx:12,   dy:18},
        {x:58,y:60, text:'slope of enlightenment',dx:-10,   dy:38},
        {x:88,y:78, text:'plateau of sustainability', dx:-210, dy:-22}
      ];

      var dkLabelsPlugin = {
        id: 'dkLabels',
        afterDatasetsDraw: function(chart){
          if(isSmall) return; // labels replaced by legend text on small screens
          var ctx = chart.ctx;
          var xScale = chart.scales.x;
          var yScale = chart.scales.y;
          ctx.save();
          ctx.font = '13px "JetBrains Mono", monospace';
          labels.forEach(function(l){
            var px = xScale.getPixelForValue(l.x) + (l.dx||0);
            var py = yScale.getPixelForValue(l.y) + (l.dy||0);
            var text = l.text;
            var metrics = ctx.measureText(text);
            var padX = 10, radius = 10;
            var boxW = metrics.width + padX*2;
            var boxH = 28;
            var boxX = px; var boxY = py - boxH;
            ctx.fillStyle = 'rgba(20,24,32,0.55)';
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1.5;
            roundedRect(ctx, boxX, boxY, boxW, boxH, radius);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = accent || '#eef1f3';
            ctx.fillText(text, boxX + padX, boxY + 18);
          });
          ctx.restore();
        }
      };

      // Draw waypoint markers above the curve to avoid the line stroke covering them.
      var dkWaypointsPlugin = {
        id: 'dkWaypoints',
        afterDatasetsDraw: function(chart){
          var ctx = chart.ctx;
          var xScale = chart.scales.x;
          var yScale = chart.scales.y;
          if(!ctx || !xScale || !yScale) return;

          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          waypointDefs.forEach(function(p){
            var px = xScale.getPixelForValue(p.x);
            var py = yScale.getPixelForValue(p.y);
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.stroke();
          });
          ctx.restore();
        }
      };

      chartInstance = new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'confidence',
              data: dataPoints,
              parsing: false,
              borderColor: curveColor,
              borderWidth: 3,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.35,
              fill: false
            },
            {
              // Invisible hit-targets so clicks/taps on dots show a tooltip.
              label: 'milestones',
              type: 'scatter',
              data: waypointNotes,
              parsing: false,
              showLine: false,
              pointRadius: 10,
              pointHoverRadius: 10,
              pointHitRadius: 14,
              pointBackgroundColor: 'rgba(0,0,0,0)',
              pointBorderColor: 'rgba(0,0,0,0)',
              pointHoverBackgroundColor: 'rgba(0,0,0,0)',
              pointHoverBorderColor: 'rgba(0,0,0,0)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 800/420,
          layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
          interaction: { mode: 'nearest', intersect: true },
          scales: {
            x: {
              type: 'linear',
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: tickColor },
              title: {
                display: true,
                text: 'wisdom →',
                color: tickColor,
                font: { family: 'JetBrains Mono', size: 12 }
              }
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: tickColor },
              title: {
                display: true,
                text: 'confidence →',
                color: tickColor,
                font: { family: 'JetBrains Mono', size: 12 }
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              displayColors: false,
              backgroundColor: 'rgba(20,24,32,0.78)',
              borderColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              titleColor: accent || '#eef1f3',
              bodyColor: '#cfd6dc',
              padding: 10,
              callbacks: {
                title: function(items){
                  if(!items || !items.length) return '';
                  var raw = items[0].raw || {};
                  return raw.title || '';
                },
                label: function(ctx){
                  // Only show timeline text for the milestone points.
                  if(!ctx || !ctx.raw) return '';
                  if(ctx.dataset && ctx.dataset.label !== 'milestones') return '';
                  var story = (ctx.raw.story || '').trim();
                  if(!story) return '';
                  return story;
                }
              }
            }
          }
        },
        plugins: isSmall ? [dkWaypointsPlugin] : [dkWaypointsPlugin, dkLabelsPlugin]
      });

      // Click/tap on a waypoint to lock the tooltip open.
      // If you click empty space, it clears the tooltip.
      if(!el._dkWaypointClickHandler){
        el._dkWaypointClickHandler = function(evt){
          if(!chartInstance) return;
          var hit = chartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
          if(hit && hit.length){
            var item = hit[0];
            var ds = chartInstance.data.datasets[item.datasetIndex];
            if(ds && ds.label === 'milestones'){
              var pos = { x: evt.offsetX, y: evt.offsetY };
              chartInstance.setActiveElements([{ datasetIndex: item.datasetIndex, index: item.index }]);
              if(chartInstance.tooltip && chartInstance.tooltip.setActiveElements){
                chartInstance.tooltip.setActiveElements([{ datasetIndex: item.datasetIndex, index: item.index }], pos);
              }
              chartInstance.update();
              return;
            }
          }
          chartInstance.setActiveElements([]);
          if(chartInstance.tooltip && chartInstance.tooltip.setActiveElements){
            chartInstance.tooltip.setActiveElements([], { x: 0, y: 0 });
          }
          chartInstance.update();
        };
        el.addEventListener('click', el._dkWaypointClickHandler);
      }
    }

    render();
    if(mq && mq.addEventListener){
      mq.addEventListener('change', render);
    } else if(mq && mq.addListener){
      mq.addListener(render);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
