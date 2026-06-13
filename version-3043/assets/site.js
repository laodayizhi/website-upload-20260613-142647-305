(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5800);
    }
  }

  var searchForms = document.querySelectorAll('[data-search-form]');

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function () {
      var input = form.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  var filterPanel = document.querySelector('[data-local-filter]');

  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var queryInput = filterPanel.querySelector('[data-filter-query]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var empty = filterPanel.querySelector('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function normalized(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalized(queryInput ? queryInput.value : '');
      var type = normalized(typeSelect ? typeSelect.value : '');
      var year = normalized(yearSelect ? yearSelect.value : '');
      var region = normalized(regionSelect ? regionSelect.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = normalized(card.getAttribute('data-search'));
        var cardType = normalized(card.getAttribute('data-type'));
        var cardYear = normalized(card.getAttribute('data-year'));
        var cardRegion = normalized(card.getAttribute('data-region'));
        var match = true;

        if (query && searchText.indexOf(query) === -1) {
          match = false;
        }
        if (type && cardType !== type) {
          match = false;
        }
        if (year && cardYear !== year) {
          match = false;
        }
        if (region && cardRegion !== region) {
          match = false;
        }

        card.classList.toggle('is-hidden', !match);
        if (match) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [queryInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();
