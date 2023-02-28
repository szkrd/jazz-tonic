<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pesti Vibe - <%- name %></title>
  <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
  <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
  <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
  <link rel='manifest' href='/site.webmanifest' />
  <meta http-equiv='X-UA-Compatible' content='IE=edge' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <meta http-equiv='Cache-Control' content='no-cache, no-store, must-revalidate' />
  <meta http-equiv='Pragma' content='no-cache' />
  <meta http-equiv='Expires' content='0' />
  <link rel='stylesheet' href='../styles/normalize.css' />
  <link rel='stylesheet' href='../styles/variables.css' />
  <link rel='stylesheet' href='../styles/main.css' />
  <link rel='stylesheet' href='../styles/modal.css' />
  <link rel='stylesheet' href='../styles/events.css' />
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
<!--INNER_CONTENT_BEGIN-->
<!-- this is a lodash template and is rendered fully on the client (https://lodash.com/docs/4.17.15#template) -->
<table>
  <tr class="event-details-row-name">
    <td class="label"><label>esemény</label></td>
    <td><h2><%- name %></h2></td>
  </tr>
  <tr class="event-details-row-tag">
    <td class="label"><label>stílus</label></td>
    <td><div class="tags js-tags-copy-target"></div></td>
  </tr>
  <% if (typeof subPage === 'boolean' && subPage) { %>
    <tr class="event-details-row-tag-static">
      <td class="label"><label>stílus</label></td>
      <td>
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
      </td>
    </tr>
  <% } %>
  <tr class="event-details-row-date">
    <td class="label"><label>kezdés</label></td>
    <td><%- startDateTimeFormatted %></td>
  </tr>
  <% if (typeof place === 'object') { %>
    <tr class="event-details-row-place">
      <td class="label"><label>helyszín</label></td>
      <td>
        <% if (typeof place.name === 'string' && place.name) { %>
          <%- place.name %>
        <% } %>
        <% if (typeof place.address === 'string' && place.address) { %>
         | <a href="https://www.google.com/maps/?q=<%- encodeURIComponent(place.address) %>" target="_blank"><%- place.address %></a>
        <% } %>
        <% if (typeof fbEventLink === 'string' || typeof place.fbEventUrl === 'string') { %>
         | <a href="<%- fbEventLink || place.fbEventUrl %>" target="_blank">facebook</a>
        <% } %>
      </td>
    </tr>
  <% } %>
  <% if (typeof performer === 'object' && typeof performer.name === 'string' && performer.name) { %>
    <tr class="event-details-row-performer">
      <td class="label"><label>előadó</label></td>
      <td><%- performer.name %></td>
    </tr>
  <% } %>
  <% if (typeof ticket === 'string' && ticket) { %>
    <tr class="event-details-row-ticket">
      <td class="label"><label>jegy</label></td>
      <% if (typeof ticketUrl === 'string' && ticketUrl) { %>
        <td class="break-all"><a href="<%- ticketUrl %>" target="_blank"><%- ticket %></a></td>
      <% } else { %>
        <td><%- ticket %></td>
      <% } %>
    </tr>
  <% } %>
  <tr class="event-details-row-description">
    <td class="label"><label>leírás</label></td>
    <td class="value-description">
      <div class="value-description-inner"><%= descriptionHtml %></div>
    </td>
</tr>
</table>
<!--INNER_CONTENT_END-->
      </div>
    </div>
  </div>
</body>
</html>
