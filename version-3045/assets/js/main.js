(function () {
    const header = document.getElementById("siteHeader");
    const menuToggle = document.getElementById("menuToggle");
    const mobilePanel = document.getElementById("mobilePanel");

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 48);
    }

    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();

    if (menuToggle && mobilePanel && header) {
        menuToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            header.classList.toggle("is-open", mobilePanel.classList.contains("is-open"));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let activeHero = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        activeHero = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === activeHero);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === activeHero);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showHero(activeHero + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(heroTimer);
            showHero(Number(dot.dataset.heroIndex || 0));
            startHero();
        });
    });

    showHero(0);
    startHero();

    const searchInput = document.getElementById("movieSearch");
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const chips = Array.from(document.querySelectorAll(".filter-chip"));
    const emptyState = document.querySelector("[data-empty-state]");
    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        const keyword = normalize(searchInput ? searchInput.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.category,
                card.dataset.year,
                card.dataset.tags
            ].join(" "));
            const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter || card.dataset.region === activeFilter;
            const matched = matchesKeyword && matchesFilter;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener("input", filterCards);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeFilter = chip.dataset.filter || "all";
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            filterCards();
        });
    });

    filterCards();
})();
