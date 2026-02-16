// Floating ember particles inside the left side panel @ about.html
(function(){
  function ready(fn){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  ready(function(){
    var social = document.querySelector('#about-side-nav .side-nav-social');
    if(!social) return;

  var MAX_PARTICLES = 14;
    var MIN_SIZE = 3, MAX_SIZE = 6;

    function rand(min,max){ return Math.random()*(max-min)+min; }

    function placeParticle(p){
      var rect = social.getBoundingClientRect();
      var w = rect.width, h = rect.height;
      // spawn within bottom band of the social area
      var left = rand(0, Math.max(0, w - 12));
      var bottom = rand(0, Math.min(32, h * 0.6));
      var size = rand(MIN_SIZE, MAX_SIZE);
  var driftX = rand(-23, 23);
  var rise = rand(80, 140);
      var duration = rand(2.4, 4.2);
      var delay = rand(0, 1.0);
      p.style.left = left + 'px';
      p.style.bottom = bottom + 'px';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--ember-driftX', driftX + 'px');
      p.style.setProperty('--ember-rise', rise + 'px');
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = delay + 's';
      p.style.opacity = (0.45 + Math.random()*0.35).toFixed(2);
    }

    function createParticle(){
      var p = document.createElement('div');
      p.className = 'ember-particle';
      placeParticle(p);
      p.addEventListener('animationiteration', function(){ placeParticle(p); });
      return p;
    }

    for(var i=0;i<MAX_PARTICLES;i++){
      social.appendChild(createParticle());
    }
  });
})();