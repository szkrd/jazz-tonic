window.pv = window.pv || {};
window.pv.templates = (() => {
  const _ = window._;
  const modal = _.template(`
    <h2><%= name %></h2>
  `);
  return {
    modal,
  };
})();
