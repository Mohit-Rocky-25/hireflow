(function () {
  try {
    var d = localStorage.getItem('hireflow:v4:design') || 'neon-volt';
    var m = localStorage.getItem('hireflow:v4:theme-mode') || 'dark';
    var t = 'dark';
    if (d === 'spruce') {
      t = m === 'light' ? 'light' : 'dark';
    } else {
      d = 'neon-volt';
      t = 'dark';
      if (localStorage.getItem('hireflow:v4:theme-mode') === 'light') {
        localStorage.setItem('hireflow:v4:theme-mode', 'dark');
      }
    }
    document.documentElement.setAttribute('data-design', d);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
  } catch (e) {}
})();
