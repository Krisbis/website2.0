// Toggle play/pause for background video on About and blog post pages.
(function () {
  var PAUSE_ICON = "\u275A\u275A";
  var PLAY_ICON = "\u25BA";

  function setState(isPlaying, button, icon) {
    icon.textContent = isPlaying ? PAUSE_ICON : PLAY_ICON;
    button.setAttribute('aria-label', isPlaying ? 'Pause background video' : 'Play background video');
    button.setAttribute('title', isPlaying ? 'Pause background video' : 'Play background video');
  }

  function init() {
    var video = document.getElementById('aboutBgVideo') || document.getElementById('bgVideoWriteup');
    var button = document.getElementById('bgVideoToggle');
    var icon = document.getElementById('bgVideoToggleIcon');

    if (!video || !button || !icon) {
      return;
    }

    button.addEventListener('click', function () {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setState(false, button, icon);
          });
        }
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      setState(true, button, icon);
    });

    video.addEventListener('pause', function () {
      setState(false, button, icon);
    });

    setState(!video.paused, button, icon);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
