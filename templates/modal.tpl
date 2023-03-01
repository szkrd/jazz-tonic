<!DOCTYPE html>
<html lang="en">
<head>
  <title>Pesti Vibe - <%- name %></title>
  <%== "partials/commonHead" %>
  <link rel='stylesheet' href='../styles/normalize.css' />
  <link rel='stylesheet' href='../styles/variables.css' />
  <link rel='stylesheet' href='../styles/main.css' />
  <link rel='stylesheet' href='../styles/modal.css' />
  <link rel='stylesheet' href='../styles/events.css' />
  <link rel='stylesheet' href='../styles/footer.css' />
  <link rel='stylesheet' href='../styles/subpage.css' />
</head>
<body class="event-subpage">
  <div class='page-content'>
    <h1 class='flex-child logo-wrapper'>
      <a href='/'>
        <img src='../images/logo.png' alt='Pesti Vibe' class='logo' />
      </a>
    </h1>
    <div class="fake-modal modal">
      <h2><%- name %></h2>
      <div class="modal-content">
<!-- this is a lodash template and CAN BE rendered on the client (https://lodash.com/docs/4.17.15#template) -->
<!-- do NOT use partial include here, this section must remain raw and unrendered for the "templatize" helper! -->
<!-- do NOT rename, move or modify the content markers (the ones ending in BEGIN and END)! -->
<!--INNER_CONTENT_BEGIN-->
<div class="event-modal-table table">
  <div class="event-details-row-name row">
    <div class="label cell cell-left"><label>esemény</label></div>
    <div class="cell cell-right"><h2><%- name %></h2></div>
  </div>
  <div class="event-details-row-tag row">
    <div class="label cell cell-left"><label>stílus</label></div>
    <div class="cell cell-right"><div class="tags js-tags-copy-target"></div></div>
  </div>
  <% if (typeof subPage === 'boolean' && subPage) { %>
    <div class="event-details-row-tag-static row">
      <div class="label cell cell-left"><label>stílus</label></div>
      <div class="cell cell-right">
        <div class='event-genres-tags tags'>
          <% if (genre) { %>
            <span class='genre genre-or-tag' data-value='<%- genre %>'><%- genre %></span>
          <% } %>
          <% if (tags) { %>
            <% tags.forEach((tag) => { %>
              <span class='tag genre-or-tag js-event-tag' data-value='<%- tag %>'><%- tag %></span>
            <% }) %>
          <% } %>
        </div>
      </div>
    </div>
  <% } %>
  <div class="event-details-row-date row">
    <div class="label cell cell-left"><label>kezdés</label></div>
    <div class="cell cell-right"><%- startDateTimeFormatted %></div>
  </div>
  <% if (typeof place === 'object') { %>
    <div class="event-details-row-place row">
      <div class="label cell cell-left"><label>helyszín</label></div>
      <div class="cell cell-right">
        <% if (typeof place.name === 'string' && place.name) { %>
          <%- place.name %>
        <% } %>
        <% if (typeof place.address === 'string' && place.address) { %>
         | <a href="https://www.google.com/maps/?q=<%- encodeURIComponent(place.address) %>" target="_blank"><%- place.address %></a>
        <% } %>
        <% if (typeof fbEventLink === 'string' || typeof place.fbEventUrl === 'string') { %>
         | <a href="<%- fbEventLink || place.fbEventUrl %>" target="_blank">facebook</a>
        <% } %>
      </div>
    </div>
  <% } %>
  <% if (typeof performer === 'object' && typeof performer.name === 'string' && performer.name) { %>
    <div class="event-details-row-performer row">
      <div class="label cell cell-left"><label>előadó</label></div>
      <div class="cell cell-right"><%- performer.name %></div>
    </div>
  <% } %>
  <% if (typeof ticket === 'string' && ticket) { %>
    <div class="event-details-row-ticket row">
      <div class="label cell cell-left"><label>jegy</label></div>
      <% if (typeof ticketUrl === 'string' && ticketUrl) { %>
        <div class="break-all cell cell-right"><a href="<%- ticketUrl %>" target="_blank"><%- ticket %></a></div>
      <% } else { %>
        <div class="cell cell-right"><%- ticket %></div>
      <% } %>
    </div>
  <% } %>
  <div class="event-details-row-description row last">
    <div class="label cell cell-left"><label>leírás</label></div>
    <div class="value-description cell cell-right">
      <div class="value-description-inner"><%= descriptionHtml %></div>
    </div>
  </div>
</div>
<!--INNER_CONTENT_END-->
      </div>
    </div>
  </div>
  <%== "partials/footer" %>
</body>
</html>
