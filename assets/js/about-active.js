// Highlight current About section in the left side panel
(function(){
  function ready(fn){ if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); } }

  ready(function(){
    var container = document.getElementById('about-sections');
    var sections = Array.prototype.slice.call(document.querySelectorAll('#about-sections .about-section'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('#about-side-nav a[href^="#"]'));
    var swipeIndicator = document.querySelector('.swipe-indicator-glass');

    if(!container || sections.length === 0 || navLinks.length === 0){ return; }

    // Hide the swipe indicator when reaching the end of content
    function updateSwipeIndicator(){
      if(!swipeIndicator) return;
      var remaining = container.scrollHeight - (container.scrollTop + container.clientHeight);
      var atEnd = remaining <= 6; // px threshold
      swipeIndicator.classList.toggle('is-hidden', atEnd);
    }

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

    function getNavIdForSection(sec){
      if(!sec) return null;
      return sec.getAttribute('data-nav') || sec.id || null;
    }

    // IntersectionObserver (preferred)
    try{
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var navId = getNavIdForSection(entry.target);
            if(navId){ setActive(navId); }
          }
        });
      }, {
        root: container,            // scrollable container
        threshold: 0.6,             // consider active when ~60% visible
        rootMargin: '0px 0px 0px 0px'
      });
      sections.forEach(function(sec){ if(sec.id){ observer.observe(sec); } });

      container.addEventListener('scroll', updateSwipeIndicator, { passive: true });
      window.addEventListener('resize', updateSwipeIndicator);
      updateSwipeIndicator();
    } catch(e){
      // Fallback: compute active on scroll
      function computeActive(){
        var containerRect = container.getBoundingClientRect();
        var bestNavId = null;
        var bestVisible = -Infinity;
        sections.forEach(function(sec){
          var r = sec.getBoundingClientRect();
          // overlap within container viewport
          var top = Math.max(r.top, containerRect.top);
          var bottom = Math.min(r.bottom, containerRect.bottom);
          var visible = bottom - top;
          if(visible > bestVisible){
            bestVisible = visible;
            bestNavId = getNavIdForSection(sec);
          }
        });
        if(bestNavId){ setActive(bestNavId); }
      }
      container.addEventListener('scroll', computeActive, { passive: true });
      container.addEventListener('scroll', updateSwipeIndicator, { passive: true });
      window.addEventListener('resize', computeActive);
      window.addEventListener('resize', updateSwipeIndicator);
      computeActive();
      updateSwipeIndicator();
    }

    // Sync with hash changes (e.g., clicking anchor links)
    window.addEventListener('hashchange', function(){
      var id = (location.hash || '').replace('#','');
      if(!id) return;
      var target = document.getElementById(id);
      var navId = (target && target.getAttribute('data-nav')) ? target.getAttribute('data-nav') : id;
      setActive(navId);
    });

    // Immediate feedback on link click
    navLinks.forEach(function(a){
      a.addEventListener('click', function(){
        var href = a.getAttribute('href') || '';
        if(href.charAt(0) !== '#') return;
        var id = href.slice(1);
        var target = document.getElementById(id);
        var navId = (target && target.getAttribute('data-nav')) ? target.getAttribute('data-nav') : id;
        setActive(navId);
      });
    });

    // Initialize state using the first section
    var initial = sections[0];
    var initialNav = getNavIdForSection(initial);
    if(initialNav){ setActive(initialNav); }
  });
})();