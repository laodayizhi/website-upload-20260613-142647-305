(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setMobilePanel() {
        var button = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var willOpen = panel.hasAttribute('hidden');
            if (willOpen) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });
    }

    function setHero() {
        var slides = selectAll('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var railCards = selectAll('.hero-rail-card');
        var prev = document.querySelector('.hero-arrow.prev');
        var next = document.querySelector('.hero-arrow.next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-index')) || 0);
                start();
            });
        });

        railCards.forEach(function (card) {
            card.addEventListener('mouseenter', function () {
                show(Number(card.getAttribute('data-hero-index')) || 0);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function setListFilters() {
        var sections = selectAll('.list-section');
        sections.forEach(function (section) {
            var input = section.querySelector('.list-filter-input');
            var year = section.querySelector('.list-year-filter');
            var cards = selectAll('.filter-card', section);
            if (!cards.length || (!input && !year)) {
                return;
            }

            function apply() {
                var query = normalizeText(input ? input.value : '');
                var yearValue = year ? year.value : '';
                cards.forEach(function (card) {
                    var text = normalizeText([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.textContent
                    ].join(' '));
                    var matchText = !query || text.indexOf(query) !== -1;
                    var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    card.classList.toggle('hidden', !(matchText && matchYear));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
        });
    }

    function escapeHTML(value) {
        return String(value || '').replace(/[&<>'"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[char];
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHTML(tag) + '</span>';
        }).join('');
        return '<article class="movie-card filter-card">' +
            '<a class="poster-link" href="' + escapeHTML(movie.url) + '">' +
            '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
            '<span class="poster-glow"></span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta-line"><span>' + escapeHTML(movie.category) + '</span><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.region) + '</span></div>' +
            '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>' +
            '<p>' + escapeHTML(movie.description) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function setSearchPage() {
        var results = document.getElementById('search-results');
        var input = document.getElementById('search-query');
        var data = window.SEARCH_MOVIES || [];
        if (!results || !input || !data.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render() {
            var query = normalizeText(input.value);
            var matched = data.filter(function (movie) {
                if (!query) {
                    return false;
                }
                var text = normalizeText([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.category,
                    movie.description,
                    (movie.tags || []).join(' ')
                ].join(' '));
                return text.indexOf(query) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(cardTemplate).join('');
        }

        input.addEventListener('input', render);
        render();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.querySelector('.player-cover');
        if (!video || !cover || !streamUrl) {
            return;
        }
        var hls = null;
        var ready = false;

        function attach() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function play() {
            attach();
            cover.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setMobilePanel();
        setHero();
        setListFilters();
        setSearchPage();
    });
}());
