<div class='top-controls'>
  <div class='top-controls-flex-row'>
    <h1 class='flex-child logo-wrapper'>
      <a href='/' class='js-home-link'>
        <img src='images/logo.png' alt='Pesti Vibe' class='logo' />
      </a>
    </h1>
    <div class='flex-child search-input-wrapper'>
      <input placeholder='kereső' type='text' class='search-input js-search-input' style='display:none' />
    </div>
    <div class='flex-child top-right-buttons'>
      <div class='share-url'>
        <button class='js-share-button' title='share search' aria-label='share search url'>
          <%= helpers.includeSvg('share') %>
        </button>
        <div class='share-dialog js-share-dialog' style='display:none'>
          <label for='share-url-textarea'>A keresés url-je:</label>
          <textarea id='share-url-textarea' class='js-share-url-textarea' readonly></textarea>
          <div class='action-buttons'>
            <button
              class='js-copy-url-to-clipboard'
              title='copy to clipboard'
              aria-label='copy url to clipboard'
            ><%= helpers.includeSvg('clipboard') %></button>
          </div>
        </div>
      </div>
      <div class='theme-switcher'>
        <button class='js-theme-button-light' title='light theme' aria-label='select light theme'>
          <%= helpers.includeSvg('sun') %>
        </button>
        <button class='js-theme-button-dark' title='dark theme' aria-label='select dark theme'>
          <%= helpers.includeSvg('moon') %>
        </button>
      </div>
    </div>
  </div>
  <div class='top-controls-row'>
    <div class='js-clickable-tag-filter tag-filter'></div>
  </div>
  <div class='top-controls-row'>
    <div class='js-clickable-dates date-filter'>
      <div class='calendar-icon'><%= helpers.includeSvg('calendar') %></div>
      <div class='calendar-buttons'>
        <button class='date js-mod-date' data-value='today'>ma</button>
        <button class='date js-mod-date' data-value='tomorrow'>holnap</button>
        <button class='date js-mod-date' data-value='weekend'>hétvégén</button>
        <button class='date js-mod-date' data-value='this-week'>egész héten</button>
        <button class='date js-mod-date' data-value='next-week'>jövő héten</button>
        <button class='date js-mod-date' data-value='reset'>bármikor</button>
      </div>
    </div>
  </div>
</div>
