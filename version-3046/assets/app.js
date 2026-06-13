(() => {
  const onReady = (handler) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handler);
    } else {
      handler();
    }
  };

  const depthPrefix = () => document.body.dataset.depth === "nested" ? "../" : "./";

  const resolvePath = (path) => depthPrefix() + path.replace(/^\.\//, "");

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const initImages = () => {
    document.querySelectorAll("img").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) {
        image.classList.add("is-empty");
      }
      image.addEventListener("error", () => image.classList.add("is-empty"), { once: true });
    });
  };

  const initMobileMenu = () => {
    const button = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", () => {
      const isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-label", "收起导航");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-label", "展开导航");
      }
    });
  };

  const initHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    };
    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    const restart = () => {
      window.clearInterval(timer);
      start();
    };
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        restart();
      });
    });
    start();
  };

  const renderSearchResults = (box, results, term) => {
    if (!box) {
      return;
    }
    if (!term || results.length === 0) {
      box.setAttribute("hidden", "");
      box.innerHTML = "";
      return;
    }
    box.innerHTML = results.map((item) => `
      <a href="${resolvePath(item.url)}">
        <strong>${item.title}</strong>
        <span>${item.year} · ${item.region} · ${item.type}</span>
      </a>
    `).join("");
    box.removeAttribute("hidden");
  };

  const initGlobalSearch = () => {
    const inputs = Array.from(document.querySelectorAll(".global-search"));
    if (!inputs.length || typeof MOVIE_DATA === "undefined") {
      return;
    }
    inputs.forEach((input) => {
      const scope = input.closest(".header-search") || input.closest(".mobile-panel-inner") || document;
      const resultBox = scope.querySelector(".search-results");
      input.addEventListener("input", () => {
        const term = normalize(input.value);
        const results = MOVIE_DATA.filter((item) => {
          const text = normalize([item.title, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" "));
          return text.includes(term);
        }).slice(0, 10);
        renderSearchResults(resultBox, results, term);
      });
      document.addEventListener("click", (event) => {
        if (!scope.contains(event.target) && resultBox) {
          resultBox.setAttribute("hidden", "");
        }
      });
    });
  };

  const initFilters = () => {
    const bars = Array.from(document.querySelectorAll("[data-filter-bar]"));
    bars.forEach((bar) => {
      const section = bar.closest("section") || document;
      const cards = Array.from(section.querySelectorAll("[data-movie-card]"));
      const empty = section.querySelector("[data-filter-empty]");
      const search = bar.querySelector("[data-filter-search]");
      const type = bar.querySelector("[data-filter-type]");
      const region = bar.querySelector("[data-filter-region]");
      const year = bar.querySelector("[data-filter-year]");
      const apply = () => {
        const keyword = normalize(search && search.value);
        const typeValue = normalize(type && type.value);
        const regionValue = normalize(region && region.value);
        const yearValue = normalize(year && year.value);
        let visible = 0;
        cards.forEach((card) => {
          const text = normalize([card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.category].join(" "));
          const matched = (!keyword || text.includes(keyword)) && (!typeValue || normalize(card.dataset.type) === typeValue) && (!regionValue || normalize(card.dataset.region) === regionValue) && (!yearValue || normalize(card.dataset.year) === yearValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      [search, type, region, year].filter(Boolean).forEach((control) => control.addEventListener("input", apply));
    });
  };

  const attachMedia = (video, url, player) => {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve();
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      player.hlsInstance = hls;
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        hls.on(Hls.Events.MANIFEST_PARSED, finish);
        window.setTimeout(finish, 1400);
      });
    }
    video.src = url;
    return Promise.resolve();
  };

  const initPlayers = () => {
    document.querySelectorAll("[data-video-player]").forEach((player) => {
      const video = player.querySelector("video");
      const overlay = player.querySelector("[data-play-overlay]");
      const button = player.querySelector("[data-play-button]");
      if (!video || !overlay || !button) {
        return;
      }
      const start = () => {
        const url = video.dataset.video;
        if (!url) {
          return;
        }
        overlay.classList.add("is-hidden");
        video.controls = true;
        const play = () => {
          const request = video.play();
          if (request && typeof request.catch === "function") {
            request.catch(() => overlay.classList.remove("is-hidden"));
          }
        };
        if (player.dataset.ready === "1") {
          play();
          return;
        }
        player.dataset.ready = "1";
        attachMedia(video, url, player).then(play);
      };
      button.addEventListener("click", start);
      overlay.addEventListener("click", start);
      video.addEventListener("click", () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    });
  };

  onReady(() => {
    initImages();
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initFilters();
    initPlayers();
  });
})();
