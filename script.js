const productCard = ({ image, title = "Men's Essential Tee", variant = "(Black)", price = "$32.00", detailed = false }) => `
  <article class="product-card-mini">
    <a class="product-card-mini__image" href="product.html">
      <img src="${image}" alt="${title} ${variant}">
      <button class="heart" type="button" aria-label="Add to favorites">♡</button>
    </a>
    <h3><a href="product.html">${title} <span>${variant}</span></a></h3>
    <p>${price}</p>
    ${detailed ? `
      <div class="color-row" aria-label="Available colors"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="size-row" aria-label="Available sizes"><span>XL</span><span>L</span><span>M</span><span>S</span></div>
    ` : ""}
  </article>
`;

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
    heart.classList.toggle("is-favorite");
    const selected = heart.classList.contains("is-favorite");
    heart.textContent = selected ? "♥" : "♡";
    heart.setAttribute("aria-label", selected ? "Remove from favorites" : "Add to favorites");
  }

  const filterTrigger = event.target.closest(".filter-trigger");
  if (filterTrigger) {
    const filters = document.getElementById(filterTrigger.getAttribute("aria-controls"));
    const open = !filters?.classList.contains("open");
    filters?.classList.toggle("open", open);
    filterTrigger.setAttribute("aria-expanded", String(open));
  }

  const filterGroup = event.target.closest(".filter-group > button");
  if (filterGroup) {
    filterGroup.parentElement.classList.toggle("expanded");
  }

  const accordionButton = event.target.closest(".accordion-item > button");
  if (accordionButton) {
    accordionButton.parentElement.classList.toggle("open");
  }

  const thumbnail = event.target.closest(".thumbnail");
  if (thumbnail) {
    const mainImage = document.querySelector("[data-main-product-image]");
    document.querySelectorAll(".thumbnail").forEach((item) => item.classList.remove("active"));
    thumbnail.classList.add("active");
    if (mainImage) {
      mainImage.src = thumbnail.dataset.image;
    }
  }

  const colorButton = event.target.closest(".color-picker button");
  if (colorButton) {
    document.querySelectorAll(".color-picker button").forEach((button) => button.classList.remove("active"));
    colorButton.classList.add("active");
  }

  const wishlist = event.target.closest(".wishlist-action");
  if (wishlist) {
    wishlist.classList.toggle("button--muted");
    wishlist.classList.toggle("button--primary");
    wishlist.firstChild.textContent = wishlist.classList.contains("button--primary") ? "♥ " : "♡ ";
  }

  const addCart = event.target.closest(".add-cart-action");
  if (addCart) {
    addCart.textContent = "Added To Cart";
    document.querySelectorAll(".cart-button b").forEach((badge) => {
      badge.textContent = String(Number(badge.textContent || 0) + 1);
    });
  }

  const tab = event.target.closest(".tab");
  if (tab) {
    tab.parentElement.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
  }
});
