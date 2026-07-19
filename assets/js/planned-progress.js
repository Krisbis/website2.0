(function(){
  // Extra untracked completed boxes to include in the displayed count.
  var EXTRA_COMPLETED = 8;

  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

  function setProgress(root, completed, target){
    if(!root) return;
    var fill = root.querySelector('.planned-progress-fill');
    var text = root.querySelector('.planned-progress-text');

    var safeCompleted = Math.max(0, Number(completed) || 0);
    var safeTarget = Math.max(1, Number(target) || 100);

    var displayedCompleted = safeCompleted + (Number(EXTRA_COMPLETED) || 0);

    // Progress fill and aria attributes
    var pct = clamp((displayedCompleted / safeTarget) * 100, 0, 100);
    if(fill) fill.style.width = pct.toFixed(2) + '%';
    if(text) text.textContent = displayedCompleted + ' / ' + safeTarget;

    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', String(safeTarget));
    root.setAttribute('aria-valuenow', String(displayedCompleted));
  }

  async function getCompletedFromProjectsPage(){
    // about.html is at site root; projects page lives under /projects/
    var url = 'projects/projects.html';
    var res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
    var html = await res.text();

    var doc = new DOMParser().parseFromString(html, 'text/html');

    var cardsContainer = doc.querySelector('article.cards');
    if(!cardsContainer) return 0;

    return cardsContainer.querySelectorAll('.previewCard').length;
  }

  function init(){
    var progress = document.getElementById('planned-progress');
    if(!progress) return;

    var target = progress.getAttribute('data-target') || '100';

    // Default state (in case fetch is blocked, e.g. file://)
    setProgress(progress, 12, target);

    getCompletedFromProjectsPage()
      .then(function(count){ setProgress(progress, count, target); })
      .catch(function(){
        // Fallback if we can't fetch (commonly happens on file:// due to CORS).
        setProgress(progress, 5, target);
      });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
