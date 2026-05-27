document.addEventListener('DOMContentLoaded', function () {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  if (!sidebarItems.length) return;

  sidebarItems.forEach(function (item) {
    item.addEventListener('click', activate);
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate.call(item); }
    });
  });

  function activate() {
    sidebarItems.forEach(function (i) { i.classList.remove('active'); });
    this.classList.add('active');

    document.querySelectorAll('.detail-content').forEach(function (panel) {
      panel.classList.remove('active');
    });
    const target = document.getElementById(this.dataset.target);
    if (target) target.classList.add('active');
  }

  const layout    = document.querySelector('.two-col-layout');
  const navToggle = document.querySelector('.nav-sidebar-toggle');

  if (layout && navToggle) {
    navToggle.addEventListener('click', function () {
      const isCollapsed = layout.classList.toggle('sidebar-collapsed');
      const icon = navToggle.querySelector('i[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', isCollapsed ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons();
      }
    });
  }
});
