(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = all(".hero-slide");
    var dots = all(".hero-dots button");
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearchForms() {
    all(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initPageFilter() {
    var input = document.querySelector(".page-filter-input");
    var cards = all(".searchable .movie-card, .searchable .rank-link");
    var empty = document.querySelector(".search-empty");
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    function run() {
      var keyword = text(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    input.addEventListener("input", run);
    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearchForms();
    initPageFilter();
  });
})();
