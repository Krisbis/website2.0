(function(){
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.glass-info'));
  if(!buttons.length) return;

  function setOpen(btn, open){
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except){
    buttons.forEach(function(btn){
      if(btn !== except) setOpen(btn, false);
    });
  }

  buttons.forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var nowOpen = !btn.classList.contains('is-open');
      closeAll(btn);
      setOpen(btn, nowOpen);
    });
  });

  document.addEventListener('click', function(e){
    var t = e.target;
    if(t && t.closest && (t.closest('.glass-info') || t.closest('.glass-tooltip'))) return;
    closeAll();
  });
})();
