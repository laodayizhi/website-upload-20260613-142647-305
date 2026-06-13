(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initSliders() {
        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
            var next = slider.querySelector("[data-slide-next]");
            var prev = slider.querySelector("[data-slide-prev]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-year-filter]");
            var typeSelect = scope.querySelector("[data-type-filter]");
            var sortSelect = scope.querySelector("[data-sort-select]");
            var grid = scope.querySelector("[data-card-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];
            var empty = scope.querySelector("[data-empty-result]");

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function applySort() {
                if (!grid || !sortSelect) {
                    return;
                }
                var mode = sortSelect.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === "heat") {
                        return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
                    }
                    if (mode === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilter();
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }
            applyFilter();
        });
    }

    ready(function () {
        initNavigation();
        initSliders();
        initFilters();
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector("[data-play-trigger]");
    var loaded = false;
    var hlsObject = null;

    if (!video) {
        return;
    }

    function attachSource(startAfterReady) {
        if (loaded) {
            if (startAfterReady) {
                video.play().catch(function () {});
            }
            return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            if (startAfterReady) {
                video.play().catch(function () {});
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsObject = new window.Hls();
            hlsObject.loadSource(sourceUrl);
            hlsObject.attachMedia(video);
            hlsObject.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (startAfterReady) {
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = sourceUrl;
        if (startAfterReady) {
            video.play().catch(function () {});
        }
    }

    function playMovie() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
        attachSource(true);
    }

    if (cover) {
        cover.addEventListener("click", playMovie);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playMovie();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsObject) {
            hlsObject.destroy();
        }
    });
}
