function createMoviePlayer(videoId, coverId, buttonId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var attached = false;

    function attach() {
        if (!video || attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    if (button) {
        button.addEventListener("click", play);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }
}
