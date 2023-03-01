<div class='events-table'>
  <% _.forEach(events, (event) => { %>
    <div
      id='event-<%- event.rowIdx %>'
      class='events-table-row js-event js-clickable-row <%- helpers.showIf(event.soldOut, "sold-out") %>'
      tabindex='0'
    >
      <div class='event-name'>
        <a href='./<%- event.dataUriForHtml %>' class='js-event-name js-event-details-opener event-name-link'>
          <%- event.name %>
        </a>
      </div>
      <div class='event-merged-section'>
        <div class='event-genres-tags event-merge-section-col js-event-genres-tags-merged'>
          <% if (event.genre) { %>
            <span
              class='genre genre-or-tag js-event-genre'
              data-value='<%- event.genre %>'
              style='color:<%- event.genreColor %>;background-color:<%- event.genreColorBg %>'
            >
              <%- event.genre %>
            </span>
          <% } /* end if genre */ %>
          <% if (event.tags) { %>
            <% _.forEach(event.tags, (tag) => { %>
              <span class='tag genre-or-tag js-event-tag' data-value='<%- tag %>'>
                <%- tag %>
              </span>
            <% }) /* end forEach tags */ %>
          <% } /* end if tags */ %>
        </div>
        <div
          class='event-merge-section-col event-date js-event-date'
          data-date='<%- event.startDateTimeNumber %>'
        ><%- event.startDateTimeFormatted %></div>
        <div class='event-place event-merge-section-col'><span
            href='<%- event.place.fbEventUrl %>'
            target='_blank'
            id='event-place-<%- event.place.rowIdx %>'
            class='js-event-place-name'
          ><%- event.place.name %></span></div>
      </div>
    </div>
  <% }) /* end forEach*/ %>
</div>
