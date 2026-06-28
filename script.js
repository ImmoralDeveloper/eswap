const STORE_KEYS = {
  cart: "tiendita.cart",
  favorites: "tiendita.favorites",
  session: "tiendita.session",
  registeredUser: "tiendita.registeredUser"
};

const defaultCart = [
  {
    id: "drop-01",
    title: "Drop 01",
    variant: "4-pack · Blue",
    price: 150,
    image: "assets/detail-related-01.jpg",
    quantity: 1
  }
];

const defaultFavorites = [
  { id: "home-product-01", title: "Floral Essential Dress", variant: "Red", price: 32, image: "assets/home-product-01.jpg" },
  { id: "home-product-03", title: "Everyday Graphic Tee", variant: "White", price: 32, image: "assets/home-product-03.jpg" }
];

const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
    return JSON.parse(value);
  } catch {
    return structuredClone(fallback);
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The static UI still works when storage is unavailable.
  }
};

const money = (value) => `$${Number(value).toFixed(2)}`;
const productIdFromImage = (image) => image.split("/").pop().replace(/\.[^.]+$/, "");
let cart = readStore(STORE_KEYS.cart, defaultCart);
let favorites = readStore(STORE_KEYS.favorites, defaultFavorites);

const updateCounters = () => {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count], [data-account-cart-count]").forEach((node) => {
    node.textContent = String(cartCount);
  });
  document.querySelectorAll("[data-favorite-count]").forEach((node) => {
    node.textContent = String(favorites.length);
  });
};

const productCard = ({ image, title = "Men's Essential Tee", variant = "(Black)", price = "$32.00", detailed = false }) => {
  const id = productIdFromImage(image);
  const selected = favorites.some((item) => item.id === id);
  return `
    <article class="product-card-mini" data-product-id="${id}" data-product-title="${title}" data-product-variant="${variant}" data-product-price="${Number(String(price).replace(/[^0-9.]/g, "")) || 32}" data-product-image="${image}">
      <a class="product-card-mini__image" href="product.html">
        <img src="${image}" alt="${title} ${variant}">
        <button class="heart${selected ? " is-favorite" : ""}" type="button" aria-label="${selected ? "Remove from favorites" : "Add to favorites"}">${selected ? "♥" : "♡"}</button>
      </a>
      <h3><a href="product.html">${title} <span>${variant}</span></a></h3>
      <p>${price}</p>
      ${detailed ? `
        <div class="color-row" aria-label="Available colors"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="size-row" aria-label="Available sizes"><span>XL</span><span>L</span><span>M</span><span>S</span></div>
      ` : ""}
    </article>
  `;
};

const homeFeatured = [
  "assets/home-product-01.jpg",
  "assets/home-product-02.jpg",
  "assets/home-product-03.jpg",
  "assets/home-product-04.jpg"
];
const homeLatest = Array.from({ length: 8 }, (_, index) => `assets/home-product-${String(index + 5).padStart(2, "0")}.jpg`);
const catalogProducts = Array.from({ length: 24 }, (_, index) => `assets/listing-product-${String(index + 1).padStart(2, "0")}.jpg`);
const relatedProducts = [
  "assets/detail-related-01.jpg",
  "assets/detail-related-02.jpg",
  "assets/detail-related-03.jpg",
  "assets/detail-related-04.jpg",
  "assets/detail-related-04.jpg"
];

document.querySelectorAll("[data-home-grid='featured']").forEach((grid) => {
  grid.innerHTML = homeFeatured.map((image) => productCard({ image, detailed: true })).join("");
});
document.querySelectorAll("[data-home-grid='latest']").forEach((grid) => {
  grid.innerHTML = homeLatest.map((image) => productCard({ image })).join("");
});
document.querySelectorAll("[data-catalog-grid]").forEach((grid) => {
  grid.innerHTML = catalogProducts.map((image) => productCard({ image })).join("");
});
document.querySelectorAll("[data-related-grid]").forEach((grid) => {
  grid.innerHTML = relatedProducts.map((image) => productCard({ image })).join("");
});

const addToCart = (product, quantity = 1) => {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  writeStore(STORE_KEYS.cart, cart);
  updateCounters();
};

const toggleFavorite = (product) => {
  const index = favorites.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift(product);
  }
  writeStore(STORE_KEYS.favorites, favorites);
  updateCounters();
  return index < 0;
};

const renderCart = () => {
  const list = document.querySelector("[data-cart-list]");
  if (!list) return;
  const empty = document.querySelector("[data-cart-empty]");
  list.innerHTML = cart.map((item) => `
    <article class="cart-item" data-cart-id="${item.id}">
      <div class="cart-item__product">
        <a href="product.html"><img src="${item.image}" alt="${item.title}"></a>
        <div><p class="post-kicker">${item.id === "drop-01" ? "FIGMALAND EDIT" : "FAVORITE"}</p><h2><a href="product.html">${item.title}</a></h2><span>${item.variant}</span><button type="button" data-cart-remove>Remove</button></div>
      </div>
      <div class="quantity-control"><button type="button" data-cart-decrease aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-increase aria-label="Increase quantity">+</button></div>
      <strong>${money(item.price * item.quantity)}</strong>
    </article>
  `).join("");
  const isEmpty = cart.length === 0;
  list.hidden = isEmpty;
  if (empty) empty.hidden = !isEmpty;
  document.querySelector(".cart-table-heading")?.toggleAttribute("hidden", isEmpty);
  document.querySelector(".cart-actions")?.toggleAttribute("hidden", isEmpty);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  document.querySelectorAll("[data-cart-subtotal]").forEach((node) => { node.textContent = money(subtotal); });
  document.querySelectorAll("[data-cart-tax]").forEach((node) => { node.textContent = money(tax); });
  document.querySelectorAll("[data-cart-total]").forEach((node) => { node.textContent = money(subtotal + tax); });
  updateCounters();
};

const renderFavorites = () => {
  const grid = document.querySelector("[data-favorites-grid]");
  if (!grid) return;
  const empty = document.querySelector("[data-favorites-empty]");
  grid.innerHTML = favorites.map((item) => `
    <article class="favorite-card" data-favorite-id="${item.id}">
      <a class="favorite-card__image" href="product.html"><img src="${item.image}" alt="${item.title}"><button type="button" data-favorite-remove aria-label="Remove from favorites">♥</button></a>
      <div class="favorite-card__body"><h2><a href="product.html">${item.title}</a></h2><p>${item.variant}</p><div><strong>${money(item.price)}</strong><button class="button button--primary" type="button" data-favorite-cart>Move to cart</button></div></div>
    </article>
  `).join("");
  grid.hidden = favorites.length === 0;
  if (empty) empty.hidden = favorites.length !== 0;
  document.querySelectorAll("[data-favorites-total]").forEach((node) => { node.textContent = String(favorites.length); });
  updateCounters();
};

const initializeAccount = () => {
  const guest = document.querySelector("[data-account-guest]");
  const userPanel = document.querySelector("[data-account-user]");
  if (!guest || !userPanel) return;
  const session = readStore(STORE_KEYS.session, null);
  const loggedIn = Boolean(session?.loggedIn);
  guest.hidden = loggedIn;
  userPanel.hidden = !loggedIn;
  if (loggedIn) {
    document.querySelectorAll("[data-account-name]").forEach((node) => { node.textContent = session.name || session.username || "Demo"; });
    const nameInput = document.querySelector("[data-profile-form] [name='name']");
    const emailInput = document.querySelector("[data-profile-form] [name='email']");
    if (nameInput) nameInput.value = session.name || "Demo User";
    if (emailInput) emailInput.value = session.email || "demo@figmaland.test";
  }
};

const setupAuth = () => {
  const authForms = document.querySelectorAll("[data-auth-form]");
  if (!authForms.length) return;
  const feedback = document.querySelector("[data-auth-feedback]");
  const showFeedback = (message, error = false) => {
    feedback.textContent = message;
    feedback.classList.toggle("error", error);
  };
  document.querySelector("[data-fill-demo]")?.addEventListener("click", () => {
    const form = document.querySelector("[data-auth-form='login']");
    form.elements.username.value = "demo";
    form.elements.password.value = "demo";
    showFeedback("Demo credentials filled.");
  });
  authForms.forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (form.dataset.authForm === "login") {
      const registered = readStore(STORE_KEYS.registeredUser, null);
      const username = String(data.get("username") || "");
      const password = String(data.get("password") || "");
      const isDemo = username === "demo" && password === "demo";
      const isRegistered = registered?.username === username && registered?.password === password;
      if (!isDemo && !isRegistered) {
        showFeedback("The username or password is incorrect.", true);
        return;
      }
      const user = isDemo
        ? { loggedIn: true, username: "demo", name: "Demo User", email: "demo@figmaland.test" }
        : { loggedIn: true, username, name: registered.name, email: registered.email };
      writeStore(STORE_KEYS.session, user);
      showFeedback("Login successful. Opening your account…");
      window.setTimeout(() => { window.location.href = "account.html"; }, 350);
    } else {
      const user = {
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        username: String(data.get("username") || ""),
        password: String(data.get("password") || "")
      };
      writeStore(STORE_KEYS.registeredUser, user);
      writeStore(STORE_KEYS.session, { ...user, password: undefined, loggedIn: true });
      showFeedback("Account created. Opening your dashboard…");
      window.setTimeout(() => { window.location.href = "account.html"; }, 350);
    }
  }));
};

const setupInstagramSlider = () => {
  document.querySelectorAll("[data-instagram-slider]").forEach((slider) => {
    const track = slider.querySelector(".instagram-track");
    const cards = [...track.querySelectorAll(".instagram-card")];
    const dots = [...slider.parentElement.querySelectorAll(".carousel-dots button")];
    let index = 0;
    const maxIndex = () => window.innerWidth <= 767 ? cards.length - 1 : Math.max(0, cards.length - 3);
    const move = (nextIndex) => {
      index = Math.max(0, Math.min(nextIndex, maxIndex()));
      const cardWidth = cards[0]?.getBoundingClientRect().width || 349;
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
      track.style.transform = `translateX(${-index * (cardWidth + gap)}px)`;
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === Math.min(index, dots.length - 1)));
    };
    slider.querySelector(".instagram-arrow--prev")?.addEventListener("click", () => move(index - 1));
    slider.querySelector(".instagram-arrow--next")?.addEventListener("click", () => move(index + 1));
    dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => move(dotIndex)));
    window.addEventListener("resize", () => move(Math.min(index, maxIndex())));
    move(0);
  });
};

const setupBlogFilters = () => {
  const buttons = [...document.querySelectorAll("[data-blog-filter]")];
  if (!buttons.length) return;
  const cards = [...document.querySelectorAll("[data-blog-grid] [data-tags]")];
  const popular = [...document.querySelectorAll("[data-popular-posts] [data-tags]")];
  const result = document.querySelector("[data-filter-result]");
  const empty = document.querySelector("[data-blog-empty]");
  buttons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.blogFilter;
    buttons.forEach((item) => item.classList.toggle("active", item === button));
    let count = 0;
    cards.forEach((card) => {
      const visible = filter === "all" || card.dataset.tags.split(" ").includes(filter);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    popular.forEach((item) => {
      item.hidden = filter !== "all" && !item.dataset.tags.split(" ").includes(filter);
    });
    if (result) result.textContent = filter === "all" ? "Showing all articles" : `${count} article${count === 1 ? "" : "s"} tagged “${filter}”`;
    if (empty) empty.hidden = count !== 0;
  }));
};

setupAuth();
setupInstagramSlider();
setupBlogFilters();
initializeAccount();
renderCart();
renderFavorites();
updateCounters();

document.addEventListener("click", (event) => {
  const menuToggle = event.target.closest(".menu-toggle");
  if (menuToggle) {
    const menu = document.getElementById(menuToggle.getAttribute("aria-controls"));
    const open = !menu?.classList.contains("open");
    menu?.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }

  const heart = event.target.closest(".heart");
  if (heart) {
    event.preventDefault();
    const card = heart.closest("[data-product-id]");
    const selected = toggleFavorite({
      id: card.dataset.productId,
      title: card.dataset.productTitle,
      variant: card.dataset.productVariant,
      price: Number(card.dataset.productPrice),
      image: card.dataset.productImage
    });
    document.querySelectorAll(`[data-product-id="${card.dataset.productId}"] .heart`).forEach((item) => {
      item.classList.toggle("is-favorite", selected);
      item.textContent = selected ? "♥" : "♡";
      item.setAttribute("aria-label", selected ? "Remove from favorites" : "Add to favorites");
    });
  }

  const filterTrigger = event.target.closest(".filter-trigger");
  if (filterTrigger) {
    const filters = document.getElementById(filterTrigger.getAttribute("aria-controls"));
    const open = !filters?.classList.contains("open");
    filters?.classList.toggle("open", open);
    filterTrigger.setAttribute("aria-expanded", String(open));
  }

  const filterGroup = event.target.closest(".filter-group > button");
  if (filterGroup) filterGroup.parentElement.classList.toggle("expanded");

  const accordionButton = event.target.closest(".accordion-item > button");
  if (accordionButton) accordionButton.parentElement.classList.toggle("open");

  const thumbnail = event.target.closest(".thumbnail");
  if (thumbnail) {
    const mainImage = document.querySelector("[data-main-product-image]");
    document.querySelectorAll(".thumbnail").forEach((item) => item.classList.remove("active"));
    thumbnail.classList.add("active");
    if (mainImage) {
      mainImage.src = thumbnail.dataset.image;
      mainImage.style.objectPosition = thumbnail.dataset.position || "center";
    }
  }

  const galleryArrow = event.target.closest(".thumbnail-strip .carousel-arrow");
  if (galleryArrow) {
    const thumbnails = [...galleryArrow.parentElement.querySelectorAll(".thumbnail")].filter((item) => getComputedStyle(item).display !== "none");
    const currentIndex = Math.max(0, thumbnails.findIndex((item) => item.classList.contains("active")));
    const nextIndex = galleryArrow.classList.contains("next")
      ? (currentIndex + 1) % thumbnails.length
      : (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    thumbnails[nextIndex]?.click();
  }

  const colorButton = event.target.closest(".color-picker button");
  if (colorButton) {
    document.querySelectorAll(".color-picker button").forEach((button) => button.classList.remove("active"));
    colorButton.classList.add("active");
  }

  const wishlist = event.target.closest(".wishlist-action");
  if (wishlist) {
    const selected = toggleFavorite({ id: "drop-01", title: "Drop 01", variant: "4-pack · Blue", price: 150, image: "assets/detail-main.jpg" });
    wishlist.classList.toggle("button--muted", !selected);
    wishlist.classList.toggle("button--primary", selected);
    wishlist.innerHTML = `${selected ? "♥" : "♡"} <span>${selected ? "Saved" : "Add To Wishlist"}</span>`;
  }

  const addCartButton = event.target.closest(".add-cart-action");
  if (addCartButton) {
    addToCart({ id: "drop-01", title: "Drop 01", variant: "4-pack · Blue", price: 150, image: "assets/detail-related-01.jpg" });
    addCartButton.textContent = "Added To Cart";
  }

  const tab = event.target.closest(".tab");
  if (tab) {
    tab.parentElement.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
  }

  const authTab = event.target.closest("[data-auth-tab]");
  if (authTab) {
    document.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.toggle("active", item === authTab));
    document.querySelectorAll("[data-auth-form]").forEach((form) => form.classList.toggle("active", form.dataset.authForm === authTab.dataset.authTab));
    const feedback = document.querySelector("[data-auth-feedback]");
    if (feedback) feedback.textContent = "";
  }

  const cartItem = event.target.closest("[data-cart-id]");
  if (cartItem) {
    const item = cart.find((entry) => entry.id === cartItem.dataset.cartId);
    if (event.target.closest("[data-cart-increase]")) item.quantity += 1;
    if (event.target.closest("[data-cart-decrease]")) item.quantity = Math.max(1, item.quantity - 1);
    if (event.target.closest("[data-cart-remove]")) cart = cart.filter((entry) => entry.id !== item.id);
    if (event.target.closest("[data-cart-increase], [data-cart-decrease], [data-cart-remove]")) {
      writeStore(STORE_KEYS.cart, cart);
      renderCart();
    }
  }

  if (event.target.closest("[data-clear-cart]")) {
    cart = [];
    writeStore(STORE_KEYS.cart, cart);
    renderCart();
  }

  if (event.target.closest("[data-checkout]")) {
    const button = event.target.closest("[data-checkout]");
    button.textContent = cart.length ? "Checkout ready" : "Your cart is empty";
  }

  const favoriteCard = event.target.closest("[data-favorite-id]");
  if (favoriteCard) {
    const item = favorites.find((entry) => entry.id === favoriteCard.dataset.favoriteId);
    if (event.target.closest("[data-favorite-remove]")) {
      event.preventDefault();
      favorites = favorites.filter((entry) => entry.id !== item.id);
      writeStore(STORE_KEYS.favorites, favorites);
      renderFavorites();
    }
    if (event.target.closest("[data-favorite-cart]")) {
      addToCart(item);
      favorites = favorites.filter((entry) => entry.id !== item.id);
      writeStore(STORE_KEYS.favorites, favorites);
      renderFavorites();
    }
  }

  if (event.target.closest("[data-logout]")) {
    writeStore(STORE_KEYS.session, null);
    initializeAccount();
  }
});

document.querySelector("[data-profile-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const session = readStore(STORE_KEYS.session, {});
  const updated = { ...session, name: String(data.get("name") || ""), email: String(data.get("email") || "") };
  writeStore(STORE_KEYS.session, updated);
  const feedback = document.querySelector("[data-profile-feedback]");
  if (feedback) feedback.textContent = "Saved";
  initializeAccount();
});
