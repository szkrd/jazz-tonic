<!DOCTYPE html>
<html lang='en'>
  <head>
    <title>Pesti Vibe</title>
    <%== "partials/commonHead" %>
    <script type='text/javascript'>window.pv={meta:<%= meta %>,templates:{}}</script>
    <%= helpers.linkCss(['normalize', 'variables', 'loader', 'main', 'top', 'events', 'footer', 'modal']) %>
    <%= helpers.linkJs([
      'vendor/lodash.4.17.21.min',
      'vendor/dayjs.1.11.7.min',
      'utils.log',
      'utils.storage',
      'utils.url',
      'utils.dom',
      'utils.i18n',
      'utils.resource',
      'utils.date',
      'utils.clipboard',
      'modules.events',
      'modules.controls',
    ]) %>
  </head>
  <body>
    <div class='page-content'>
      <!-- TOP CONTROLS -->
      <%== "partials/pageTopControls" %>
      <div class='js-event-count event-count' style='display:none'></div>
      <!-- EVENTS TABLE -->
      <% if (hasEvents) { %>
        <%== "partials/eventList" %>
      <% } /* endif */ %>
      <p class='no-events-message js-no-events-message' style='display:none'>
        Nincsenek új események.
      </p>
      <!-- EVENT MODAL -->
      <%== "partials/modalWrapper" %>
    </div>
    <!-- FOOTER -->
    <%== "partials/footer" %>
    <%= helpers.templatize('modal') %>
    <%= helpers.linkJs('main') %>
  </body>
</html>
