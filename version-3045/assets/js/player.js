(function () {
    function initMoviePlayer(containerId, streamUrl) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const video = container.querySelector("video");
        const playButton = container.querySelector(".play-layer");
        let prepared = false;
        let hlsInstance = null;

        if (!video) {
            return;
        }

        function prepareVideo() {
            if (prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            prepared = true;
        }

        function startPlayback() {
            prepareVideo();
            video.controls = true;

            if (playButton) {
                playButton.classList.add("is-hidden");
            }

            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (playButton) {
                        playButton.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (playButton) {
            playButton.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && playButton) {
                playButton.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
