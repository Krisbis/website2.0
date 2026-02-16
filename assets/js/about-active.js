// Highlight current About section in the left side panel
(function(){
  function ready(fn){ if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); } }

  ready(function(){
    var container = document.getElementById('about-sections');
    var sections = Array.prototype.slice.call(document.querySelectorAll('#about-sections .about-section'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('#about-side-nav a[href^="#"]'));

    if(!container || sections.length === 0 || navLinks.length === 0){ return; }

    // map section id -> nav link
    var linkMap = {};
    navLinks.forEach(function(a){
      var href = a.getAttribute('href');
      if(href && href.charAt(0) === '#'){
        linkMap[href.slice(1)] = a;
      }
    });

    function setActive(id){
      navLinks.forEach(function(a){ a.classList.remove('active'); });
      var link = linkMap[id];
      if(link){ link.classList.add('active'); }
    }

    // IntersectionObserver (preferred)
    try{
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var id = entry.target.id;
            if(id){ setActive(id); }
          }
        });
      }, {
        root: container,            // scrollable container
        threshold: 0.6,             // consider active when ~60% visible
        rootMargin: '0px 0px 0px 0px'
      });
      sections.forEach(function(sec){ if(sec.id){ observer.observe(sec); } });
    } catch(e){
      // Fallback: compute active on scroll
      function computeActive(){
        var containerRect = container.getBoundingClientRect();
        var bestId = null;
        var bestVisible = -Infinity;
        sections.forEach(function(sec){
          var r = sec.getBoundingClientRect();
          // overlap within container viewport
          var top = Math.max(r.top, containerRect.top);
          var bottom = Math.min(r.bottom, containerRect.bottom);
          var visible = bottom - top;
          if(visible > bestVisible){
            bestVisible = visible;
            bestId = sec.id;
          }
        });
        if(bestId){ setActive(bestId); }
      }
      container.addEventListener('scroll', computeActive, { passive: true });
      window.addEventListener('resize', computeActive);
      computeActive();
    }

    // Sync with hash changes (e.g., clicking anchor links)
    window.addEventListener('hashchange', function(){
      var id = (location.hash || '').replace('#','');
      if(id){ setActive(id); }
    });

    // Immediate feedback on link click
    navLinks.forEach(function(a){
      a.addEventListener('click', function(){
        var href = a.getAttribute('href') || '';
        if(href.charAt(0) === '#'){ setActive(href.slice(1)); }
      });
    });

    // Initialize state using the first section
    var initial = sections[0];
    if(initial && initial.id){ setActive(initial.id); }
  });
})();