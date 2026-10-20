(function () {
  "use strict";

  const PHONE = "8 701 123 45 67";
  const PROMO_CODE = "KOFE10";
  const PROMO_PCT = 15;
  const FIRST_ORDER_PCT = 10;
  const MIN_ORDER = 1500;
  const FREE_DELIVERY_FROM = 3000;
  const DELIVERY_COST = 500;

  /* ---------- storage ---------- */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- version under test ---------- */
  const V11 = load("qc_version", "1.0") === "1.1";
  const IS_EDGE = /Edg\//.test(navigator.userAgent);
  document.body.classList.add(V11 ? "v11" : "v10");
  const imgOf = p => (V11 && p.id === 4 ? "img/latte.svg" : p.img);

  /* ---------- i18n ---------- */
  function lang() { return load("qc_lang", "ru") === "kz" ? "kz" : "ru"; }
  function t(key, vars) {
    let s = (I18N[lang()] && I18N[lang()][key]) || I18N.ru[key] || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function money(n) {
    const sign = n < 0 ? "-" : "";
    return sign + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " тг";
  }

  /* ---------- data helpers ---------- */
  const users = () => load("qc_users", []);
  const session = () => load("qc_session", null);
  function currentUser() {
    const s = session();
    if (!s) return null;
    return users().find(u => u.email.toLowerCase() === s) || null;
  }
  const getCart = () => load("qc_cart", []);
  const setCart = c => save("qc_cart", c);
  const getOrders = () => load("qc_orders", []);
  const product = id => PRODUCTS.find(p => p.id === Number(id));
  function unitPrice(item) {
    const p = product(item.id);
    const size = SIZES.find(s => s.code === item.size) || SIZES[1];
    return p.price + size.mod + (item.syrup ? 200 : 0);
  }

  function totals(cart) {
    const subtotal = cart.reduce((sum, it) => product(it.id) ? sum + unitPrice(it) * it.qty : sum, 0);
    const promo = load("qc_promo", null) === PROMO_CODE ? PROMO_PCT : 0;
    const user = currentUser();
    const hasOrders = user ? getOrders().some(o => o.email === user.email.toLowerCase()) : true;
    const first = user && !hasOrders ? FIRST_ORDER_PCT : 0;
    const pct = Math.max(promo, first);
    const source = pct === 0 ? null : (promo >= first ? "promo" : "first");
    const discount = Math.round(subtotal * pct / 100);
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;
    return {
      subtotal, discount, pct, source, delivery,
      bothApplicable: promo > 0 && first > 0,
      total: subtotal - discount + delivery
    };
  }

  /* ---------- layout ---------- */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2200);
  }

  function renderHeader() {
    const page = document.body.dataset.page;
    const logged = !!session();
    const count = getCart().length;
    const nav = [
      ["home.html", "nav_home", "home"],
      ["menu.html", "nav_menu", "menu"],
      ["aktsii.html", "nav_promo", "promo"],
      ["contacts.html", "nav_contacts", "contacts"]
    ].map(([href, key, id]) => `<a href="${href}" class="${page === id ? "active" : ""}">${t(key)}</a>`).join("");
    document.getElementById("header").innerHTML = `
      <div class="standbar">
        <div class="wrap standbar-in">
          <a href="index.html">${t("stand_back")}</a>
          <span>${t("stand_version", { v: V11 ? "1.1" : "1.0" })}</span>
        </div>
      </div>
      <div class="topbar">
        <div class="wrap topbar-in">
          <span>${t("hours_short")}</span>
          <span>${PHONE}</span>
        </div>
      </div>
      <div class="wrap head-in">
        <a class="logo" href="home.html"><span class="logo-mark">Q</span> QA Portal</a>
        <nav class="nav">${nav}</nav>
        <div class="head-tools">
          <div class="lang">
            <button type="button" data-lang="ru" class="${lang() === "ru" ? "on" : ""}">RU</button>
            <button type="button" data-lang="kz" class="${lang() === "kz" ? "on" : ""}">KZ</button>
          </div>
          <a class="cart-link" href="cart.html">${t("cart")} <span class="badge" id="cart-count">${count}</span></a>
          <a class="user-link" id="user-link" href="${logged ? "account.html" : "login.html"}">${logged ? t("account") : t("login")}</a>
        </div>
      </div>`;
    document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => {
      save("qc_lang", b.dataset.lang);
      location.reload();
    }));
  }

  function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = getCart().length;
  }

  function renderFooter() {
    document.getElementById("footer").innerHTML = `
      <div class="wrap foot-in">
        <div><strong>QA Portal</strong><br>${t("footer_address")}<br>${PHONE}</div>
        <div class="foot-note">${t("footer_note")}</div>
      </div>`;
  }

  function productCard(p, opts) {
    const l = lang();
    const badges = [];
    if (opts && opts.hitBadge && p.hit) badges.push(`<span class="tag tag-hit">${t("hit")}</span>`);
    if (!p.inStock) badges.push(`<span class="tag tag-out">${t("out_of_stock")}</span>`);
    return `
      <article class="card">
        <a href="product.html?id=${p.id}" class="card-img"><img src="${imgOf(p)}" alt="${esc(p.name[l])}"></a>
        <div class="card-body">
          <div class="tags">${badges.join("")}</div>
          <h3><a href="product.html?id=${p.id}">${esc(p.name[l])}</a></h3>
          <div class="muted">${p.catalogVolume} мл</div>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <a class="btn btn-small" href="product.html?id=${p.id}">${t("details")}</a>
          </div>
        </div>
      </article>`;
  }

  /* ---------- pages ---------- */
  const pages = {};

  pages.home = function (app) {
    const hits = PRODUCTS.filter(p => p.hit).slice(0, 6);
    app.innerHTML = `
      <section class="hero">
        <div class="wrap hero-in">
          <h1>${t("slogan")}</h1>
          <p>${t("hero_sub")}</p>
          <a class="btn btn-order" href="menu.html">${t("hero_btn")}</a>
        </div>
      </section>
      ${session() ? "" : `
      <section class="wrap">
        <div class="promo-banner">
          <span>${t("banner_guest")}</span>
          <a class="btn" href="register.html">${t("banner_btn")}</a>
        </div>
      </section>`}
      <section class="wrap section">
        <div class="section-head">
          <h2>${t("hits_title")}</h2>
          <a href="menu.html">${t("all_menu")}</a>
        </div>
        <div class="grid-auto">${hits.map(p => productCard(p, { hitBadge: true })).join("")}</div>
      </section>`;
  };

  pages.menu = function (app) {
    app.innerHTML = `
      <section class="wrap section">
        <h1>${t("menu_title")}</h1>
        <div class="toolbar">
          <form id="search-form" class="search">
            <input id="q" type="text" placeholder="${t("search_ph")}">
            <button class="btn" type="submit">${t("search_btn")}</button>
          </form>
          <label class="sort">${t("sort_label")}
            <select id="sort">
              <option value="pop">${t("sort_pop")}</option>
              <option value="asc">${t("sort_price_asc")}</option>
              <option value="desc">${t("sort_price_desc")}</option>
              <option value="name">${t("sort_name")}</option>
            </select>
          </label>
        </div>
        <div id="list" class="menu-grid"></div>
      </section>`;
    const l = lang();
    let query = "";
    function draw() {
      let list = PRODUCTS.slice();
      if (query) list = list.filter(p => V11 ? p.name[l].toLowerCase().includes(query.toLowerCase()) : p.name[l].includes(query));
      const mode = document.getElementById("sort").value;
      if (mode === "pop") list.sort((a, b) => b.pop - a.pop);
      if (mode === "asc") list.sort((a, b) => V11 ? a.price - b.price : b.price - a.price);
      if (mode === "desc") list.sort((a, b) => b.price - a.price);
      if (mode === "name" && !V11) list.sort((a, b) => a.name[l].localeCompare(b.name[l], l === "kz" ? "kk" : "ru"));
      if (mode === "name" && V11) list.sort((a, b) => b.pop - a.pop);
      document.getElementById("list").innerHTML = list.length
        ? list.map(p => productCard(p)).join("")
        : `<p class="muted">${t("nothing_found")}</p>`;
    }
    document.getElementById("search-form").addEventListener("submit", e => {
      e.preventDefault();
      query = document.getElementById("q").value.trim();
      draw();
    });
    document.getElementById("sort").addEventListener("change", draw);
    draw();
  };

  pages.product = function (app) {
    const l = lang();
    const p = product(new URLSearchParams(location.search).get("id"));
    if (!p) {
      app.innerHTML = `<section class="wrap section"><p>${t("not_found_product")}</p><a href="menu.html">${t("back_menu")}</a></section>`;
      return;
    }
    let size = "L";
    let qty = 1;
    app.innerHTML = `
      <section class="wrap section">
        <a href="menu.html" class="back">${t("back_menu")}</a>
        <div class="product">
          <div class="product-img"><img src="${imgOf(p)}" alt="${esc(p.name[l])}"></div>
          <div class="product-info">
            <h1>${esc(p.name[l])}</h1>
            <div class="desc">${esc(p.desc[l])}</div>
            <div class="opt">
              <div class="opt-label">${t("size")}: <strong id="vol"></strong></div>
              <div class="sizes">${SIZES.map(s => `<button type="button" class="size" data-size="${s.code}">${s.code}</button>`).join("")}</div>
            </div>
            <label class="check"><input type="checkbox" id="syrup"> ${t("syrup")}</label>
            <div class="opt">
              <div class="opt-label">${t("qty")}</div>
              <div class="qty">
                <button type="button" id="minus">−</button>
                <input type="number" id="qty" value="1" min="1" max="${V11 ? 10 : 99}">
                <button type="button" id="plus">+</button>
              </div>
            </div>
            <div class="buy">
              <span class="price big" id="sum"></span>
              <button class="btn" id="add" ${p.inStock ? "" : "disabled"}>${p.inStock ? t("add_to_cart") : t("out_of_stock")}</button>
            </div>
          </div>
        </div>
        <div class="reviews">
          <h2>${t("reviews")}</h2>
          <div id="reviews"></div>
        </div>
      </section>`;
    const qtyInput = document.getElementById("qty");
    function clampQty(v) {
      v = parseInt(v, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (V11 && v > 9) v = 9;
      if (v > 99) v = 99;
      return v;
    }
    function draw() {
      document.querySelectorAll(".size").forEach(b => b.classList.toggle("on", b.dataset.size === size));
      document.getElementById("vol").textContent = `${size} · ${p.volumes[size]} мл`;
      qtyInput.value = qty;
      const unit = unitPrice({ id: p.id, size, syrup: document.getElementById("syrup").checked });
      const syrupOn = document.getElementById("syrup").checked;
      document.getElementById("sum").textContent = money(V11 && IS_EDGE && syrupOn ? NaN : unit * qty);
    }
    document.querySelectorAll(".size").forEach(b => b.addEventListener("click", () => { size = b.dataset.size; draw(); }));
    document.getElementById("syrup").addEventListener("change", draw);
    document.getElementById("minus").addEventListener("click", () => { qty = clampQty(qty - 1); draw(); });
    document.getElementById("plus").addEventListener("click", () => { qty = clampQty(qty + (V11 ? 1 : 2)); draw(); });
    qtyInput.addEventListener("change", () => { qty = clampQty(qtyInput.value); draw(); });
    document.getElementById("add").addEventListener("click", () => {
      if (!p.inStock) return;
      const syrup = document.getElementById("syrup").checked;
      const cart = getCart();
      const same = cart.find(it => it.id === p.id && it.size === size && it.syrup === syrup);
      if (same) same.qty += qty; else cart.push({ id: p.id, size, syrup, qty });
      setCart(cart);
      updateCartCount();
      toast(t("added"));
    });
    document.getElementById("reviews").innerHTML = session()
      ? REVIEWS.map(r => `<div class="review"><strong>${esc(r.author)}</strong> <span class="stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span><p>${esc(r.text[l])}</p></div>`).join("")
      : `<p class="muted">${t("reviews_login")} · <a href="login.html">${t("login")}</a></p>`;
    draw();
  };

  function totalsHtml(tt) {
    const label = tt.source === "promo" ? t("promo_word") : t("first_order");
    return `
      <div class="row"><span>${t("subtotal")}</span><span>${money(tt.subtotal)}</span></div>
      ${tt.discount ? `<div class="row"><span>${t("discount")} ${tt.pct}% (${label})</span><span>−${money(tt.discount)}</span></div>` : ""}
      ${tt.bothApplicable ? `<div class="note">${t("not_summed")}</div>` : ""}
      <div class="row"><span>${t("delivery")}</span><span>${tt.delivery ? money(tt.delivery) : t("free")}</span></div>
      <div class="row total"><span>${t("total")}</span><span>${money(tt.total)}</span></div>`;
  }

  pages.cart = function (app) {
    const l = lang();
    const cart = getCart().filter(it => product(it.id));
    if (!cart.length) {
      app.innerHTML = `<section class="wrap section"><h1>${t("cart_title")}</h1><p class="muted">${t("cart_empty")}</p><a class="btn" href="menu.html">${t("to_menu")}</a></section>`;
      return;
    }
    app.innerHTML = `
      <section class="wrap section">
        <h1>${t("cart_title")}</h1>
        <div class="cart">
          <div class="cart-items" id="items">
            ${cart.map((it, i) => {
              const p = product(it.id);
              return `
              <div class="cart-row" data-i="${i}">
                <img src="${imgOf(p)}" alt="${esc(p.name[l])}">
                <div class="cart-name"><strong>${esc(p.name[l])}</strong><div class="muted">${it.size}${it.syrup ? ", " + t("syrup_short") : ""}</div></div>
                <div class="cart-unit">${money(unitPrice(it))}</div>
                <input class="cart-qty" type="number" value="${it.qty}" data-i="${i}">
                <button type="button" class="link-btn del" data-i="${i}">${t("delete")}</button>
              </div>`;
            }).join("")}
          </div>
          <aside class="summary">
            <form id="promo-form" class="promo">
              <input id="promo" type="text" placeholder="${t("promo_ph")}" value="${esc(load("qc_promo", "") || "")}">
              <button class="btn btn-ghost" type="submit">${t("apply")}</button>
            </form>
            <div id="totals"></div>
            <p class="note">${t("free_from")}</p>
            <p class="note" id="min-note"></p>
            <a class="btn btn-wide" id="go-checkout" href="checkout.html">${t("checkout_btn")}</a>
          </aside>
        </div>
      </section>`;
    function drawTotals() {
      const tt = totals(getCart());
      document.getElementById("totals").innerHTML = totalsHtml(tt);
      const go = document.getElementById("go-checkout");
      const low = tt.subtotal < MIN_ORDER;
      go.classList.toggle("disabled", low);
      go.setAttribute("aria-disabled", low ? "true" : "false");
      document.getElementById("min-note").textContent = low ? t("min_order") : "";
    }
    document.getElementById("go-checkout").addEventListener("click", e => {
      if (e.currentTarget.classList.contains("disabled")) e.preventDefault();
    });
    document.querySelectorAll(".cart-qty").forEach(inp => inp.addEventListener("change", () => {
      const c = getCart();
      const v = parseInt(inp.value, 10);
      c[inp.dataset.i].qty = isNaN(v) ? 1 : (V11 ? (v < 0 ? 1 : Math.min(v, 10)) : v);
      if (V11) inp.value = c[inp.dataset.i].qty;
      setCart(c);
      drawTotals();
    }));
    document.querySelectorAll(".del").forEach(btn => btn.addEventListener("click", () => {
      const c = getCart();
      c.splice(Number(btn.dataset.i), 1);
      setCart(c);
      btn.closest(".cart-row").remove();
      document.querySelectorAll(".cart-row").forEach((row, idx) => {
        row.dataset.i = idx;
        row.querySelectorAll("[data-i]").forEach(el => { el.dataset.i = idx; });
      });
      if (!c.length) location.reload();
      if (V11) drawTotals();
    }));
    document.getElementById("promo-form").addEventListener("submit", e => {
      e.preventDefault();
      const raw = document.getElementById("promo").value.trim();
      const code = V11 ? raw : raw.toUpperCase();
      if (code === PROMO_CODE) {
        save("qc_promo", PROMO_CODE);
        toast(t("promo_ok"));
      } else {
        save("qc_promo", null);
        toast(t("promo_bad"));
      }
      drawTotals();
    });
    drawTotals();
  };

  function timeSlots() {
    const now = new Date();
    const start = new Date(now.getTime() + 30 * 60000);
    let mins = start.getHours() * 60 + start.getMinutes();
    mins = Math.ceil(mins / 30) * 30;
    mins = Math.max(mins, 8 * 60);
    const slots = [];
    for (let m = mins; m <= 21 * 60 + 30; m += 30) {
      slots.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
    }
    return slots;
  }

  pages.checkout = function (app) {
    const snapshot = getCart().filter(it => product(it.id));
    if (!snapshot.length) {
      app.innerHTML = `<section class="wrap section"><h1>${t("checkout_title")}</h1><p class="muted">${t("cart_needed")}</p><a class="btn" href="menu.html">${t("to_menu")}</a></section>`;
      return;
    }
    const tt = totals(snapshot);
    if (tt.subtotal < MIN_ORDER) {
      app.innerHTML = `<section class="wrap section"><h1>${t("checkout_title")}</h1><p class="muted">${t("min_order")}</p><a class="btn" href="cart.html">${t("cart_title")}</a></section>`;
      return;
    }
    const user = currentUser();
    const slots = timeSlots();
    app.innerHTML = `
      <section class="wrap section">
        <h1>${t("checkout_title")}</h1>
        <div id="done"></div>
        <div class="checkout" id="checkout">
          <form id="order-form" class="form" novalidate>
            <label>${t("f_name")}<input id="f-name" type="text" value="${user ? esc(user.name) : ""}"><span class="err" data-for="f-name"></span></label>
            <label>${t("f_phone")}<input id="f-phone" type="text" value="${user && user.phone ? esc(user.phone) : ""}"><span class="err" data-for="f-phone"></span></label>
            <label>${t("f_city")}<select id="f-city"><option>${t("city_almaty")}</option><option>${t("city_astana")}</option></select></label>
            <label>${t("f_address")}<input id="f-address" type="text"><span class="err" data-for="f-address"></span></label>
            <label>${t("f_time")}
              ${slots.length ? `<select id="f-time">${slots.map(s => `<option>${s}</option>`).join("")}</select>` : `<div class="note warn">${t("orders_closed")}</div>`}
            </label>
            <label>${t("f_comment")}<textarea id="f-comment" rows="3"${V11 ? ' maxlength="250"' : ""}></textarea>${V11 ? '<span class="note" id="c-count">0/200</span>' : ""}</label>
            <fieldset><legend>${t("f_pay")}</legend>
              <label class="check"><input type="radio" name="pay" value="cash" checked> ${t("pay_cash")}</label>
              <label class="check"><input type="radio" name="pay" value="card"> ${t("pay_card")}</label>
            </fieldset>
            <button class="btn btn-wide" id="confirm" type="submit" ${slots.length ? "" : "disabled"}>${t("confirm")}</button>
          </form>
          <aside class="summary">${totalsHtml(tt)}</aside>
        </div>
      </section>`;
    let hideTimer = null;
    if (V11) document.getElementById("f-comment").addEventListener("input", e => {
      document.getElementById("c-count").textContent = e.target.value.length + "/200";
    });
    document.getElementById("order-form").addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      ["f-name", "f-phone", "f-address"].forEach(id => {
        const empty = !document.getElementById(id).value.trim();
        document.querySelector(`.err[data-for="${id}"]`).textContent = empty ? "Field is required" : "";
        if (empty) ok = false;
      });
      if (!ok) return;
      const orders = getOrders();
      const n = load("qc_next_order", 1001);
      save("qc_next_order", n + 1);
      const s = session();
      const comment = document.getElementById("f-comment").value;
      orders.push({ n, email: s, items: snapshot, total: tt.total, date: new Date().toISOString(), comment });
      save("qc_orders", orders);
      const done = document.getElementById("done");
      done.insertAdjacentHTML("beforeend", `
        <div class="success">
          <h2>${t("order_ok", { n })}</h2>
          <p>${t("order_sum")}: <strong>${money(tt.total)}</strong></p>
          ${comment ? `<p>${t("order_comment")}</p><div class="order-comment">${esc(comment)}</div>` : ""}
        </div>`);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        document.getElementById("checkout").style.display = "none";
        setCart([]);
        save("qc_promo", null);
        updateCartCount();
      }, 800);
    });
  };

  pages.login = function (app) {
    app.innerHTML = `
      <section class="wrap section narrow">
        <h1>${t("login_title")}</h1>
        <form id="login-form" class="form" novalidate>
          <label>${t("f_email")}<input id="l-email" type="email"></label>
          <label>${t("f_password")}<input id="l-pass" type="password"></label>
          <div class="err" id="l-err"></div>
          <button class="btn btn-wide" type="submit">${t("login_btn")}</button>
        </form>
        <p>${t("no_account")} <a href="register.html">${t("go_register")}</a></p>
      </section>`;
    document.getElementById("login-form").addEventListener("submit", e => {
      e.preventDefault();
      const email = document.getElementById("l-email").value.trim();
      const pass = document.getElementById("l-pass").value;
      const err = document.getElementById("l-err");
      if (!email || !pass) { err.textContent = t("err_required"); return; }
      const u = users().find(x => x.email.toLowerCase() === email.toLowerCase());
      if (!u) { err.textContent = t("user_not_found"); return; }
      if (u.password !== pass) { err.textContent = t("wrong_password"); return; }
      save("qc_session", u.email.toLowerCase());
      location.href = "account.html";
    });
  };

  pages.register = function (app) {
    app.innerHTML = `
      <section class="wrap section narrow">
        <h1>${t("reg_title")}</h1>
        <form id="reg-form" class="form" novalidate>
          <label>${t("f_name")}<input id="r-name" type="text"><span class="err" data-for="r-name"></span></label>
          <label>${t("f_email")}<input id="r-email" type="email"><span class="err" data-for="r-email"></span></label>
          <label>${t("f_phone_opt")}<input id="r-phone" type="tel"></label>
          <label>${t("f_password")}<input id="r-pass" type="${V11 ? "password" : "text"}"><span class="err" data-for="r-pass"></span></label>
          <label class="check"><input type="checkbox" id="r-agree"> <span>${t("agree_pre")}<a href="rules.html">${t("agree_link")}</a>${t("agree_post")}</span></label>
          <span class="err" data-for="r-agree"></span>
          <button class="btn btn-wide" type="submit">${t("reg_btn")}</button>
        </form>
        <p>${t("have_account")} <a href="login.html">${t("login")}</a></p>
      </section>`;
    document.getElementById("reg-form").addEventListener("submit", e => {
      e.preventDefault();
      const v = id => document.getElementById(id).value.trim();
      const setErr = (id, msg) => { document.querySelector(`.err[data-for="${id}"]`).textContent = msg || ""; };
      let ok = true;
      ["r-name", "r-email", "r-pass", "r-agree"].forEach(id => setErr(id, ""));
      if (!v("r-name")) { setErr("r-name", t("err_required")); ok = false; }
      if (!v("r-email")) { setErr("r-email", t("err_required")); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("r-email"))) { setErr("r-email", t("err_email")); ok = false; }
      if (!v("r-pass")) { setErr("r-pass", t("err_required")); ok = false; }
      else if (V11 ? v("r-pass").length <= 8 : v("r-pass").length < 4) { setErr("r-pass", t(V11 ? "err_pass_short8" : "err_pass_short")); ok = false; }
      if (!document.getElementById("r-agree").checked) { setErr("r-agree", t("err_agree")); ok = false; }
      if (!ok) return;
      const list = users();
      if (list.some(u => u.email.toLowerCase() === v("r-email").toLowerCase())) { setErr("r-email", t("err_exists")); return; }
      list.push({ name: v("r-name"), email: v("r-email"), phone: v("r-phone"), password: v("r-pass") });
      save("qc_users", list);
      save("qc_session", v("r-email").toLowerCase());
      location.href = "welcome.html";
    });
  };

  pages.account = function (app) {
    const user = currentUser();
    if (!user) {
      app.innerHTML = `<section class="wrap section narrow"><h1>${t("acc_title")}</h1><p>${t("need_login")}</p><a class="btn" href="login.html">${t("login")}</a></section>`;
      return;
    }
    const mine = getOrders().filter(o => o.email === user.email.toLowerCase()).sort((a, b) => b.n - a.n).slice(0, 10);
    app.innerHTML = `
      <section class="wrap section narrow" id="acc">
        <h1>${t("acc_title")}</h1>
        <p class="hello">${t("hello", { name: esc(user.email) })}</p>
        <h2>${t("orders_hist")}</h2>
        ${mine.length ? `<p class="note">${t("orders_last10")}</p>
          <ul class="orders">${mine.map(o => `<li><strong>${t("order_n", { n: o.n })}</strong> · ${new Date(o.date).toLocaleString(lang() === "kz" ? "kk-KZ" : "ru-RU")} · ${t("items_n", { n: o.items.length })} · ${money(o.total)}</li>`).join("")}</ul>`
          : `<p class="muted">${t("no_orders")}</p>`}
        <button class="btn btn-ghost" id="logout" type="button">${t("logout")}</button>
      </section>`;
    document.getElementById("logout").addEventListener("click", () => {
      toast(t("logged_out"));
      document.getElementById("acc").innerHTML = `<h1>${t("acc_title")}</h1><p>${t("need_login")}</p><a class="btn" href="login.html">${t("login")}</a>`;
      const link = document.getElementById("user-link");
      link.textContent = t("login");
      link.href = "login.html";
    });
  };

  pages.contacts = function (app) {
    app.innerHTML = `
      <section class="wrap section">
        <h1>${t("contacts_title")}</h1>
        <div class="contacts">
          <div>
            <p><span class="muted">${t("address_label")}</span><br>${t("contacts_address")}</p>
            <p><span class="muted">${t("phone_label")}</span><br>${PHONE}</p>
            <p><span class="muted">${t("hours_label")}</span><br>${t("hours_value")}</p>
            <p><span class="muted">${t("write_us")}</span><br>hello@qa-portal.example</p>
          </div>
          <div class="map" id="map">${t("map_loading")}</div>
        </div>
      </section>`;
    document.getElementById("map-frame").setAttribute("data-ready", "1");
  };

  /* ---------- boot ---------- */
  document.documentElement.lang = lang() === "kz" ? "kk" : "ru";
  renderHeader();
  renderFooter();
  const app = document.getElementById("app");
  const page = document.body.dataset.page;
  if (pages[page]) pages[page](app);
})();
