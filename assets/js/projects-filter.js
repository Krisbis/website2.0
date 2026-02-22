/**
 * projects-filter.js
 * Search, filter by difficulty, sort by date, and tag selector on the Projects page.
 *
 * Cards must carry these data attributes:
 *   data-title       – lowercase box name
 *   data-difficulty   – easy | medium | intermediate | hard | insane
 *   data-tags         – comma-separated lowercase tags
 *   data-date         – ISO date string (YYYY-MM-DD)
 */
(function () {
  'use strict';

  var searchInput    = document.getElementById('projectSearch');
  var sortBtn        = document.getElementById('sortToggle');
  var sortLabel      = document.getElementById('sortLabel');
  var grid           = document.getElementById('projectCards');
  var noResults      = document.getElementById('noResults');
  var filterBtns     = document.querySelectorAll('.projects-filter-btn');
  var tagSelectorBtn = document.getElementById('tagSelectorBtn');
  var tagDropdown    = document.getElementById('tagDropdown');
  var tagDropdownList = document.getElementById('tagDropdownList');
  var selectedTagsEl = document.getElementById('selectedTags');

  if (!searchInput || !grid) return;

  var newestFirst      = true;
  var activeDifficulty = 'all';
  var selectedTags     = [];       // currently active tag filters

  /* ── difficulty aliases (intermediate ↔ medium) ── */
  var difficultyMap = {
    easy: ['easy'],
    medium: ['medium', 'intermediate'],
    hard: ['hard'],
    insane: ['insane'],
    all: null
  };

  function matchesDifficulty(cardDiff, filter) {
    if (filter === 'all') return true;
    var aliases = difficultyMap[filter] || [filter];
    return aliases.indexOf(cardDiff) !== -1;
  }

  /* ── collect all unique tags from cards ── */
  function collectAllTags() {
    var tagSet = {};
    var cards = grid.querySelectorAll('.previewCard');
    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(',');
      tags.forEach(function (t) {
        t = t.trim();
        if (t) tagSet[t] = true;
      });
    });
    return Object.keys(tagSet).sort();
  }

  /* ── render tag dropdown items ── */
  function renderTagDropdown() {
    var allTags = collectAllTags();
    tagDropdownList.innerHTML = '';
    allTags.forEach(function (tag) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'tag-dropdown-item';
      if (selectedTags.indexOf(tag) !== -1) {
        item.classList.add('is-selected');
      }
      item.textContent = tag;
      item.setAttribute('data-tag', tag);
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleTag(tag);
      });
      tagDropdownList.appendChild(item);
    });
  }

  /* ── toggle a tag on/off ── */
  function toggleTag(tag) {
    var idx = selectedTags.indexOf(tag);
    if (idx !== -1) {
      selectedTags.splice(idx, 1);
    } else {
      selectedTags.push(tag);
    }
    renderSelectedTags();
    renderTagDropdown();
    update();
  }

  /* ── render selected tags as removable pills in the search bar ── */
  function renderSelectedTags() {
    selectedTagsEl.innerHTML = '';
    selectedTags.forEach(function (tag) {
      var pill = document.createElement('span');
      pill.className = 'selected-tag-pill';
      pill.innerHTML = tag + '<button type="button" class="selected-tag-remove" aria-label="Remove ' + tag + '">&times;</button>';
      pill.querySelector('.selected-tag-remove').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleTag(tag);
      });
      selectedTagsEl.appendChild(pill);
    });
    // Adjust search placeholder
    searchInput.placeholder = selectedTags.length ? 'Search...' : 'Search by name or tag...';
  }

  /* ── core filter/sort/search ── */
  function update() {
    var query = searchInput.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.previewCard'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title    = card.getAttribute('data-title') || '';
      var tagsStr  = card.getAttribute('data-tags')  || '';
      var tagsArr  = tagsStr.split(',').map(function (t) { return t.trim(); });
      var diff     = (card.getAttribute('data-difficulty') || '').toLowerCase();

      // Difficulty filter
      var passesFilter = matchesDifficulty(diff, activeDifficulty);

      // Tag filter: card must have ALL selected tags
      var passesTags = true;
      if (selectedTags.length > 0) {
        passesTags = selectedTags.every(function (st) {
          return tagsArr.indexOf(st) !== -1;
        });
      }

      // Text search: match against title or tags
      var passesSearch = true;
      if (query) {
        passesSearch = title.indexOf(query) !== -1 || tagsStr.indexOf(query) !== -1;
      }

      if (passesFilter && passesTags && passesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards by date
    cards.sort(function (a, b) {
      var da = a.getAttribute('data-date') || '0';
      var db = b.getAttribute('data-date') || '0';
      return newestFirst ? (db > da ? 1 : db < da ? -1 : 0)
                         : (da > db ? 1 : da < db ? -1 : 0);
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });

    if (noResults) {
      noResults.hidden = visibleCount > 0;
    }
  }

  /* ── event listeners ── */

  // Search input
  searchInput.addEventListener('input', update);

  // Sort toggle
  sortBtn.addEventListener('click', function () {
    newestFirst = !newestFirst;
    sortLabel.textContent = newestFirst ? 'Newest' : 'Oldest';
    update();
  });

  // Difficulty filters
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeDifficulty = (btn.getAttribute('data-difficulty') || 'all').toLowerCase();
      update();
    });
  });

  // Tag selector dropdown toggle
  tagSelectorBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = !tagDropdown.hidden;
    tagDropdown.hidden = isOpen;
    if (!isOpen) {
      renderTagDropdown();
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.projects-tag-selector-wrap')) {
      tagDropdown.hidden = true;
    }
  });

  // Initial render
  renderSelectedTags();
  update();
})();
