(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function initBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var input = document.getElementById("global-search");
    var select = document.getElementById("global-category");
    var results = document.getElementById("global-results");
    if (!input || !select || !results || !window.__MOVIES__) {
      return;
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var category = select.value;
      if (!q && !category) {
        results.classList.remove("is-active");
        results.innerHTML = "";
        return;
      }
      var matched = window.__MOVIES__.filter(function (movie) {
        var text = (movie.search || "").toLowerCase();
        var passText = !q || text.indexOf(q) !== -1;
        var passCategory = !category || movie.categorySlug === category;
        return passText && passCategory;
      }).slice(0, 48);
      if (!matched.length) {
        results.classList.add("is-active");
        results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        return;
      }
      results.classList.add("is-active");
      results.innerHTML = matched.map(function (movie) {
        return [
          '<a class="search-result" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span></span>',
          '</a>'
        ].join("");
      }).join("");
    }

    input.addEventListener("input", render);
    select.addEventListener("change", render);
  }

  function initPageFilter() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.getElementById("page-filter");
    var year = document.getElementById("year-filter");
    var type = document.getElementById("type-filter");
    var count = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function sync() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var passQ = !q || search.indexOf(q) !== -1;
        var passY = !y || card.getAttribute("data-year") === y;
        var passT = !t || card.getAttribute("data-type") === t;
        var show = passQ && passY && passT;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener(el.tagName === "INPUT" ? "input" : "change", sync);
      }
    });
    sync();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[char];
    });
  }

  window.mountMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverLayerId);
    var button = document.getElementById(options.playButtonId);
    var source = options.source;
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
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
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initBackToTop();
    initHero();
    initGlobalSearch();
    initPageFilter();
  });
})();
