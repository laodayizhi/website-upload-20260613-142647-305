(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var active = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5000);
            }

            function restart() {
                window.clearInterval(timer);
                start();
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }

            show(0);
            start();
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var scope = panel.closest("section") || document;
            var grid = scope.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");
            var empty = scope.querySelector("[data-empty-message]") || document.querySelector("[data-empty-message]");
            if (!grid || !input) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

            function apply(value) {
                var keyword = String(value || "").trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = String(card.getAttribute("data-title") || "").toLowerCase();
                    var matched = keyword === "" || text.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            input.addEventListener("input", function () {
                apply(input.value);
            });

            Array.prototype.slice.call(panel.querySelectorAll("[data-filter-key]")).forEach(function (button) {
                button.addEventListener("click", function () {
                    input.value = button.getAttribute("data-filter-key") || "";
                    apply(input.value);
                });
            });
        });
    });
})();
