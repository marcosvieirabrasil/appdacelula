(() => {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const items = [
    { href: "/", label: "Início", icon: "home" },
    { href: "/dinamicas", label: "Dinâmicas", icon: "spark" },
    { href: "/palavras", label: "Palavras", icon: "book" },
    { href: "/escalas", label: "Escalas", icon: "calendarPeople" },
  ];

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4.3A3.7 3.7 0 0 1 12 3.4V20a3.7 3.7 0 0 0-1.7-.4H6A2.5 2.5 0 0 0 3.5 22V5.5Z"/><path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4.3a3.7 3.7 0 0 0-1.7.4V20a3.7 3.7 0 0 1 1.7-.4H18a2.5 2.5 0 0 1 2.5 2V5.5Z"/></svg>',
    calendarPeople: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="10" y="4.5" width="10.5" height="12.5" rx="2"/><path d="M13 2.5v4M17.5 2.5v4M10 9h10.5"/><circle cx="6.2" cy="9" r="2.2"/><path d="M2.5 18c.7-2.4 2-3.7 3.7-3.7s3 1.3 3.7 3.7"/><path d="M13 12.5h4.5M13 15h3"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.3"/><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z"/><path d="m19.4 13.4 1.2 1.1-2.1 3.6-1.5-.5a7.4 7.4 0 0 1-2.2 1.3l-.3 1.5h-4.2l-.3-1.5a7.4 7.4 0 0 1-2.2-1.3l-1.5.5-2.1-3.6 1.2-1.1a7.6 7.6 0 0 1 0-2.7L4.2 9.6 6.3 6l1.5.5A7.4 7.4 0 0 1 10 5.2l.3-1.5h4.2l.3 1.5a7.4 7.4 0 0 1 2.2 1.3l1.5-.5 2.1 3.6-1.2 1.1a7.6 7.6 0 0 1 0 2.7Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
  };

  if (!document.querySelector(".app-shell") || document.querySelector(".mobile-app-topbar")) return;

  const isActive = (href) => href === "/" ? path === "/" : path === href;
  const itemMarkup = items.map((item) => `
    <a class="mobile-dock__item${isActive(item.href) ? " is-active" : ""}" href="${item.href}" ${isActive(item.href) ? 'aria-current="page"' : ""}>
      <span class="mobile-dock__icon">${icons[item.icon]}</span>
      <span>${item.label}</span>
    </a>
  `).join("");

  document.body.classList.add("has-mobile-dock");
  document.body.insertAdjacentHTML("afterbegin", `
    <header class="mobile-app-topbar" aria-label="Cabeçalho do App da Célula">
      <a class="mobile-app-topbar__brand" href="/" aria-label="App da Célula, início">
        <img src="/assets/logo-new.webp" alt="App da Célula" />
      </a>
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir opções da célula" aria-expanded="false" aria-controls="mobileSettingsPanel">
        ${icons.user}
      </button>
    </header>
  `);

  document.body.insertAdjacentHTML("beforeend", `
    <div class="mobile-settings-backdrop" id="mobileSettingsBackdrop"></div>
    <aside class="mobile-settings-panel" id="mobileSettingsPanel" aria-hidden="true" aria-labelledby="mobileSettingsTitle">
      <div class="mobile-settings-panel__handle" aria-hidden="true"></div>
      <div class="mobile-settings-panel__head">
        <div>
          <h2 id="mobileSettingsTitle">Minha célula</h2>
          <p>Organize o encontro e deixe tudo pronto para o grupo.</p>
        </div>
        <button class="mobile-settings-close" type="button" aria-label="Fechar opções">${icons.close}</button>
      </div>
      <nav class="mobile-settings-links" aria-label="Opções da célula">
        <a href="/?onboarding=1"><span class="mobile-settings-links__icon">${icons.settings}</span><span><b>Configurar célula</b><small>Nome, encontro e participantes</small></span>${icons.arrow}</a>
        <a href="/escalas"><span class="mobile-settings-links__icon">${icons.calendarPeople}</span><span><b>Organizar escala</b><small>Defina as funções do próximo encontro</small></span>${icons.arrow}</a>
        <a href="/palavras"><span class="mobile-settings-links__icon">${icons.book}</span><span><b>Palavras da célula</b><small>Prepare a conversa da semana</small></span>${icons.arrow}</a>
      </nav>
    </aside>
    <nav class="mobile-dock" aria-label="Navegação principal">${itemMarkup}</nav>
  `);

  const footer = document.querySelector(".site-footer");
  if (footer) {
    footer.classList.add("mobile-instagram");
    footer.innerHTML = '<span>Siga-nos no Instagram</span><a href="https://www.instagram.com/appdacelula" target="_blank" rel="noopener">@appdacelula</a>';
  }

  const menuButton = document.querySelector("#mobileProfileButton");
  const panel = document.querySelector("#mobileSettingsPanel");
  const backdrop = document.querySelector("#mobileSettingsBackdrop");
  const closeButton = panel?.querySelector(".mobile-settings-close");

  const setMenu = (open) => {
    menuButton?.setAttribute("aria-expanded", String(open));
    panel?.setAttribute("aria-hidden", String(!open));
    panel?.classList.toggle("is-open", open);
    backdrop?.classList.toggle("is-open", open);
    document.body.classList.toggle("mobile-settings-open", open);
  };

  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  closeButton?.addEventListener("click", () => setMenu(false));
  backdrop?.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
})();