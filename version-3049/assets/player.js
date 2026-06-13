(function () {
  function initPlayer() {
    var box = document.querySelector(".player-box");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var button = box.querySelector(".player-start");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var loaded = false;
    function attach() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function start() {
      attach();
      box.classList.add("is-playing");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initPlayer);
})();
