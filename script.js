const state = {
  products: [
    { id: 1, name: "Aurora Headphones", price: 2999, category: "Audio", rating: 4.6, image: "https://images-cdn.ubuy.co.in/656e272fdf67ec1cf20b86bd-peohzarr-wired-gaming-headset-with-noise.jpg" },
    { id: 2, name: "Nimbus Keyboard", price: 1999, category: "Accessories", rating: 4.3, image: "https://images-cdn.ubuy.co.in/66b8fc4454314977ed5892e7-nimbus-65-magnetic-hall-effect-gaming.jpg" },
    { id: 3, name: "Photon Smartwatch", price: 6499, category: "Wearables", rating: 4.7, image: "https://ptron.in/cdn/shop/products/1_ad09e85e-8f3b-4679-93e6-c1a49f547b79.jpg?v=1660710818" },
    { id: 4, name: "Zephyr Mouse", price: 999, category: "Accessories", rating: 4.2, image: "https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/resize-w:450/QDGm77eF7I-zebronics-zeb-transformer-m-wiredmouse-492574840-i-1-1200wx1200h.jpeg" },
    { id: 5, name: "Vivid 4K Monitor", price: 14999, category: "Monitors", rating: 4.5, image: "https://nationalpc.in/image/cache/catalog/product/Monitor/Dell/Alienware/AW3225QF/2-320x320.jpg.webp" },
    { id: 6, name: "Pulse Bluetooth Speaker", price: 1799, category: "Audio", rating: 4.4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8iuiZ8CH9IlQg4-NEu_jZemNy05B-P0SJJA&s" },
    { id: 7, name: "Echo Buds", price: 2199, category: "Audio", rating: 4.1, image: "https://m.media-amazon.com/images/I/81-L2pBA0xL._UF1000,1000_QL80_.jpg" },
    { id: 8, name: "Axis Webcam", price: 1299, category: "Accessories", rating: 4.0, image: "https://m.media-amazon.com/images/I/51fOH+Ml7bL._UF1000,1000_QL80_.jpg" },
    { id: 9, name: "Stride Fitness Band", price: 2299, category: "Wearables", rating: 4.3, image: "https://sparnodfitness.com/image/cache/catalog/Prodoct-Images/home-trademills/sth-1200MF/STH-1200MF%20Motorised%20Treadmill-350x350.png" }
  ],
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  filters: { search: "", category: "all", min: null, max: null, sort: "relevance", chips: new Set() }
};

const els = {
  grid: document.getElementById("productGrid"),
  tpl: document.getElementById("productCardTpl"),
  cartTpl: document.getElementById("cartItemTpl"),
  search: document.getElementById("searchInput"),
  category: document.getElementById("categoryFilter"),
  sort: document.getElementById("sortSelect"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  applyPrice: document.getElementById("applyPrice"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  drawer: document.getElementById("cartDrawer"),
  closeCart: document.getElementById("closeCart"),
  backdrop: document.getElementById("backdrop"),
  cartItems: document.getElementById("cartItems"),
  subtotal: document.getElementById("subtotal"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  chipGroup: document.getElementById("chipGroup")
};

document.getElementById("year").textContent = new Date().getFullYear();

function money(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);
}

function save() {
  localStorage.setItem("cart", JSON.stringify(state.cart));
}

function setCount() {
  els.cartCount.textContent = state.cart.reduce((a, c) => a + c.qty, 0);
}

function mountCategories() {
  const cats = ["all", ...new Set(state.products.map(p => p.category))];
  els.category.innerHTML = cats
    .map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`)
    .join("");
}

function mountChips() {
  const chips = ["New", "Popular", "Deals"];
  chips.forEach(label => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (b.classList.toggle("active")) {
        state.filters.chips.add(label);
      } else {
        state.filters.chips.delete(label);
      }
      render(); // TODO: apply chips logic to filtering
    });
    els.chipGroup.appendChild(b);
  });
}

function render() {
  const q = state.filters.search.toLowerCase();
  const cat = state.filters.category;
  const min = state.filters.min;
  const max = state.filters.max;

  let list = state.products.filter(p =>
    p.name.toLowerCase().includes(q) &&
    (cat === "all" || p.category === cat) &&
    (min == null || p.price >= min) &&
    (max == null || p.price <= max)
  );

  switch (state.filters.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating-desc": list.sort((a, b) => b.rating - a.rating); break;
    case "name-asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  els.grid.innerHTML = "";
  list.forEach(p => {
    const node = els.tpl.content.cloneNode(true);
    node.querySelector(".card-img").src = p.image;
    node.querySelector(".card-img").alt = p.name;
    node.querySelector(".rating").textContent = `★ ${p.rating}`;
    node.querySelector(".card-title").textContent = p.name;
    node.querySelector(".card-category").textContent = p.category;
    node.querySelector(".price").textContent = money(p.price);
    node.querySelector(".add").addEventListener("click", () => addToCart(p.id));
    els.grid.appendChild(node);
  });
}

function addToCart(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  const found = state.cart.find(i => i.id === id);
  if (found) {
    found.qty += 1;
  } else {
    state.cart.push({ ...prod, qty: 1 });
  }

  save();
  setCount();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  save();
  setCount();
  renderCart();
}

function setQty(id, qty) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  save();
  setCount();
  renderCart();
}

function renderCart() {
  els.cartItems.innerHTML = "";
  let subtotal = 0;

  state.cart.forEach(i => {
    const node = els.cartTpl.content.cloneNode(true);
    const row = node.querySelector(".cart-row");
    row.dataset.id = i.id;
    node.querySelector(".thumb").src = i.image;
    node.querySelector(".thumb").alt = i.name;
    node.querySelector(".title").textContent = i.name;
    node.querySelector(".cat").textContent = i.category;

    const qty = node.querySelector(".qty");
    qty.value = i.qty;
    node.querySelector(".inc").addEventListener("click", () => setQty(i.id, i.qty + 1));
    node.querySelector(".dec").addEventListener("click", () => setQty(i.id, i.qty - 1));
    qty.addEventListener("change", e => setQty(i.id, parseInt(e.target.value || "1", 10)));
    node.querySelector(".remove").addEventListener("click", () => removeFromCart(i.id));

    const line = i.qty * i.price;
    subtotal += line;
    node.querySelector(".line-price").textContent = money(line);

    els.cartItems.appendChild(node);
  });

  els.subtotal.textContent = money(subtotal);
}

function openCart(open = true) {
  els.drawer.classList.toggle("open", open);
  els.drawer.setAttribute("aria-hidden", open ? "false" : "true");
}

// --- Event Listeners ---
els.search.addEventListener("input", e => {
  state.filters.search = e.target.value;
  render();
});
els.category.addEventListener("change", e => {
  state.filters.category = e.target.value;
  render();
});
els.sort.addEventListener("change", e => {
  state.filters.sort = e.target.value;
  render();
});
els.applyPrice.addEventListener("click", () => {
  const min = parseInt(els.minPrice.value, 10);
  const max = parseInt(els.maxPrice.value, 10);
  state.filters.min = Number.isFinite(min) ? min : null;
  state.filters.max = Number.isFinite(max) ? max : null;
  render();
});
els.cartBtn.addEventListener("click", () => {
  renderCart();
  openCart(true);
});
els.closeCart.addEventListener("click", () => openCart(false));
els.backdrop.addEventListener("click", () => openCart(false));
els.checkoutBtn.addEventListener("click", () => {
  if (!state.cart.length) {
    alert("Your cart is empty.");
    return;
  }
  alert("Demo only — connect this to a backend or payment provider.");
});
els.clearCartBtn.addEventListener("click", () => {
  if (confirm("Clear all items from cart?")) {
    state.cart = [];
    save();
    setCount();
    renderCart();
  }
});

// --- Init ---
mountCategories();
mountChips();
render();
setCount();
