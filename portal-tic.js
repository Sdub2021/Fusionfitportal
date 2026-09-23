(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function addLink(parent, html) {
    if (!parent) return;
    if (parent.querySelector('a[href="/tic.html"]')) return;
    parent.insertAdjacentHTML("beforeend", html);
  }
  ready(function () {
    var nav = document.querySelector("nav .hidden.md\\:flex, nav div.hidden");
    if (nav && !nav.querySelector('a[href="/tic.html"]')) {
      var cmc = null;
      nav.querySelectorAll("a").forEach(function (a) {
        if (/CMC37|taichi/i.test(a.textContent + a.getAttribute("href"))) cmc = a;
      });
      var a = document.createElement("a");
      a.href = "/tic.html";
      a.className = "hover:text-orange-400";
      a.textContent = "TIC";
      if (cmc && cmc.nextSibling) cmc.parentNode.insertBefore(a, cmc.nextSibling);
      else if (cmc) cmc.parentNode.appendChild(a);
      else nav.appendChild(a);
    }
    var drawer = document.getElementById("mobile-drawer");
    if (drawer && !drawer.querySelector('a[href="/tic.html"]')) {
      var join = null;
      drawer.querySelectorAll("a").forEach(function (x) {
        if (/join the list/i.test(x.textContent)) join = x;
      });
      var d = document.createElement("a");
      d.href = "/tic.html";
      d.className = "drawer-link text-2xl py-4";
      d.textContent = "TIC · Tick game";
      if (join) drawer.insertBefore(d, join);
      else drawer.appendChild(d);
    }
    var heroBtns = document.querySelector(".main-portal .mt-8");
    if (heroBtns && !heroBtns.querySelector('a[href="/tic.html"]')) {
      var play = document.createElement("a");
      play.href = "/tic.html";
      play.className = "studio-btn";
      play.style.marginLeft = ".6rem";
      play.innerHTML = '<span aria-hidden="true">🐾</span> Play TIC';
      var first = heroBtns.querySelector("a.studio-btn");
      if (first && first.nextSibling) first.parentNode.insertBefore(play, first.nextSibling);
      else heroBtns.insertBefore(play, heroBtns.firstChild);
      var sub = heroBtns.querySelector("p");
      if (sub && sub.textContent.indexOf("TIC") < 0) sub.textContent = sub.textContent.replace(/\s*$/, " · TIC");
    }
    var grid = document.querySelector("#services .grid");
    if (grid && !grid.querySelector("[data-fit-tic]")) {
      var card = document.createElement("div");
      card.className = "service-card";
      card.setAttribute("data-fit-tic", "1");
      card.innerHTML = '<div class="text-4xl mb-6">🐾</div><h3 class="text-3xl font-bold mb-4 text-white">TIC</h3><p class="text-zinc-400 leading-relaxed mb-6">You are the cat. Tics latch on. Reach your human before the lamp burns out.</p><a href="/tic.html" class="block w-full py-3 rounded-xl bg-white/10 hover:bg-orange-500 transition text-center">Play the tick game</a>';
      grid.appendChild(card);
    }
    var foot = document.querySelector("footer .flex-wrap");
    addLink(foot, '<a href="/tic.html" class="hover:text-white">TIC</a>');
  });
})();
