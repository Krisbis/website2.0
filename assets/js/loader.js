// Loader logic for bash-style ASCII progress bar and cycling phrases
// Hides loader when page and video are loaded
(function(){
    const loader = document.getElementById('loader-overlay');
    const bar = document.getElementById('loader-cli-bar');
    const phrase = document.getElementById('loader-phrase');
    if (!loader || !bar || !phrase) return;

    const phrases = [
      'Testing in prod...',
      '"I will now inject the shellcode", said the doctor\n\nMe: "Wait what?"',
      'Data breach = decentralized surprise backup',
      'Removing -rf / -fr -fr -nocap',
      'Discombobulating...',
      'Bypassing my own firewall...',
      'Cant get hacked, if you dont give anyone a computer...',
      'Stocking up caffeine...',
      'Feeling nauseous due to caffeine...',
      'Establishing secure connection to my mom\n\n\n\'s basement server...',
      'Decrypting my own passwords...',
      'TXxrYH4tWW18ZS8qV2F2KZurLp5kYWJqa2stYY4gzkOwLp9rent8YsxsYXwhc2J7cC56Z2drIiNHyqJi2nJqbHxrL3lkjn2LKuwujGx9YWJ5mG8ubGBkamtwfS5oeGFjI3qFqy6KYHF5NARneXibfdQl8XmaeSB3YXmYf2xrL2liYy15b3ppZjF1M6imSb9GS09JQno1BoN6mnqtNMIheXl5IpVle3p0aGggYWFjIX1vemBm0rgzzUYwIEheY3tV3jbkTrFgynouaWt4zH5hYSF4Ynlmdy55Y3pmI2eZ4A=='
    ];
    let phraseIdx = Math.floor(Math.random() * phrases.length);
    let progress = 0;
    let interval, phraseInterval;
    // ASCII bar settings
    const BAR_LENGTH = 32;
    const BAR_CHAR = '#';
    const BAR_EMPTY = '-';
    const BAR_LEFT = '[';
    const BAR_RIGHT = ']';

    function renderBar() {
      const filled = Math.round((progress/100)*BAR_LENGTH);
      const empty = BAR_LENGTH - filled;
      bar.textContent = `${BAR_LEFT}${BAR_CHAR.repeat(filled)}${BAR_EMPTY.repeat(empty)}${BAR_RIGHT} ${Math.round(progress)}%`;
    }

    function nextPhrase() {
      phrase.style.opacity = 0;
      setTimeout(()=>{
        phrase.textContent = phrases[phraseIdx % phrases.length];
        phrase.style.opacity = 1;
        phraseIdx++;
      }, 350);
    }

    function animateBar() {
      interval = setInterval(()=>{
        // Simulate progress
        if(progress < 100) {
          progress += Math.random()*8+2; // 2-10%
          if(progress > 100) progress = 100;
          renderBar();
        }
        if(progress >= 100) {
          clearInterval(interval);
          setTimeout(hideLoader, 600);
        }
      }, 220);
    }

    function hideLoader() {
      clearInterval(phraseInterval);
      loader.style.opacity = 0;
      setTimeout(()=>{ loader.style.display = 'none'; }, 600);
    }

    // Cycle phrases every 2.5s
    phraseInterval = setInterval(nextPhrase, 2500);
    nextPhrase();
    renderBar();
    animateBar();

    // Wait for main video to load
    window.addEventListener('load', ()=>{
      // find background video
      const vid = document.querySelector('.bg-video');
      if(vid && vid.readyState < 3) {
        vid.addEventListener('canplaythrough', ()=>{
          progress = 100;
          renderBar();
          clearInterval(interval);
          setTimeout(hideLoader, 600);
        });
      } else {
        progress = 100;
        renderBar();
        clearInterval(interval);
        setTimeout(hideLoader, 600);
      }
    });

})();
