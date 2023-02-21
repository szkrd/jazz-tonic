<!-- this is a lodash template and is rendered fully on the client (https://lodash.com/docs/4.17.15#template) -->
<table>
  <tr>
    <td class="label"><label>esemény</label></td>
    <td><h2><%- name %></h2></td>
  </tr>
  <tr>
    <td class="label"><label>stílus</label></td>
    <td><div class="tags js-tags-copy-target"></div></td>
  </tr>
  <tr>
    <td class="label"><label>kezdés</label></td>
    <td><%- startDateTimeFormatted %></td>
  </tr>
  <% if (typeof place === 'object') { %>
    <tr>
      <td class="label"><label>helyszín</label></td>
      <td>
        <%- place.name %>
        <% if (place.address) { %>
         | <a href="https://www.google.com/maps/?q=<%- encodeURIComponent(place.address) %>" target="_blank"><%- place.address %></a>
        <% } %>
        <% if (place.fbEventUrl) { %>
         | <a href="<%- place.fbEventUrl %>" target="_blank">facebook</a>
        <% } %>
      </td>
    </tr>
  <% } %>
  <% if (typeof performer === 'object') { %>
    <tr>
      <td class="label"><label>előadó</label></td>
      <td><%- performer.name %></td>
    </tr>
  <% } %>
  <% if (ticket) { %>
    <tr>
      <td class="label"><label>jegy</label></td>
      <% if (ticketUrl) { %>
        <td class="break-all"><a href="<%- ticketUrl %>" target="_blank"><%- ticket %></a></td>
      <% } else { %>
        <td><%- ticket %></td>
      <% } %>
    </tr>
  <% } %>
  <tr>
    <td class="label"><label>leírás</label></td>
    <td class="value-description">
      <div class="value-description-inner"><%- description %></div>
    </td>
</tr>
</table>
