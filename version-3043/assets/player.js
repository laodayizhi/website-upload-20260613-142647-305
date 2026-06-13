(function () {
  function bindVideo(video, stream) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    bindVideo(video, stream);
    video.setAttribute('controls', 'controls');

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playAction = video.play();

    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(player);
        }
      });
    }
  });
})();
