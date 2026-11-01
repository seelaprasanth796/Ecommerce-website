const products = [
  { id: 1, name: "Wireless Headphones", category: "electronics", price: 79.99, description: "High-quality sound with noise cancellation.", emoji: "🎧" },
  { id: 2, name: "Smart Watch", category: "electronics", price: 199.99, description: "Track your fitness and stay connected.", emoji: "⌚" },
  { id: 3, name: "Cotton T-Shirt", category: "clothing", price: 24.99, description: "Comfortable and breathable cotton shirt.", emoji: "👕" },
  { id: 4, name: "Jeans", category: "clothing", price: 59.99, description: "Classic blue denim jeans.", emoji: "👖" },
  { id: 5, name: "Leather Wallet", category: "accessories", price: 39.99, description: "A stylish everyday wallet.", emoji: "👛" },
  { id: 6, name: "Sunglasses", category: "accessories", price: 89.99, description: "Stylish sunglasses for sunny days.", emoji: "😎" },
  { id: 7, name: "Running Shoes", category: "clothing", price: 119.99, description: "Comfortable shoes for running and casual wear.", emoji: "👟" },
  { id: 8, name: "Phone Case", category: "accessories", price: 19.99, description: "Protective case for your smartphone.", emoji: "📱" },
  { id: 9, name: "USB-C Cable", category: "electronics", price: 14.99, description: "Fast-charging USB-C cable.", emoji: "🔌" }
];

let cart = [];
let selectedProduct = null;
let selectedQuantity = 1;
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
  try { cart = JSON.parse(localStorage.getItem("shophub-cart")) || []; } catch { cart = []; }
  displayProducts(products);
  updateCartUI();
  document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") searchProducts();
  });
  document.getElementById("contactForm").addEventListener("submit", event => {
    event.preventDefault();
    alert("Thanks for your message! This demo form does not send data to a server.");
    event.target.reset();
  });
});

function displayProducts(list) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }
  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image" role="button" tabindex="0" aria-label="View ${product.name}">${product.emoji}</div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatMoney(product.price)}</span>
          <button class="add-btn">Add to Cart</button>
        </div>
      </div>`;
    card.querySelector(".product-image").addEventListener("click", () => openProductModal(product.id));
    card.querySelector(".product-image").addEventListener("keydown", e => { if (e.key === "Enter") openProductModal(product.id); });
    card.querySelector(".add-btn").addEventListener("click", () => addToCartItem(product.id, 1));
    grid.appendChild(card);
  });
}

function filterByCategory(category, button) {
  currentCategory = category;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");
  applyFilters();
}

function searchProducts() { applyFilters(); }

function applyFilters() {
  const term = document.getElementById("searchInput").value.trim().toLowerCase();
  const filtered = products.filter(product => {
    const categoryMatch = currentCategory === "all" || product.category === currentCategory;
    const textMatch = product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term);
    return categoryMatch && textMatch;
  });
  displayProducts(filtered);
}

function openProductModal(id) {
  selectedProduct = products.find(product => product.id === id);
  selectedQuantity = 1;
  if (!selectedProduct) return;
  document.getElementById("modalTitle").textContent = selectedProduct.name;
  document.getElementById("modalDescription").textContent = selectedProduct.description;
  document.getElementById("modalPrice").textContent = formatMoney(selectedProduct.price);
  document.getElementById("modalImage").textContent = selectedProduct.emoji;
  document.getElementById("quantityInput").value = 1;
  document.getElementById("productModal").style.display = "block";
  document.getElementById("productModal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
  document.getElementById("productModal").setAttribute("aria-hidden", "true");
}
window.addEventListener("click", event => {
  const modal = document.getElementById("productModal");
  if (event.target === modal) closeModal();
});
function increaseQuantity() {
  const input = document.getElementById("quantityInput");
  input.value = Math.min(99, (parseInt(input.value, 10) || 1) + 1);
}
function decreaseQuantity() {
  const input = document.getElementById("quantityInput");
  input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
}
function addToCartFromModal() {
  if (!selectedProduct) return;
  const quantity = Math.max(1, Math.min(99, parseInt(document.getElementById("quantityInput").value, 10) || 1));
  addToCartItem(selectedProduct.id, quantity);
  closeModal();
}
function addToCartItem(id, quantity) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += quantity;
  else cart.push({ id, name: product.name, price: product.price, emoji: product.emoji, quantity });
  saveCart();
  updateCartUI();
  alert(product.name + " added to your cart.");
}
function updateQuantity(id, change) {
  const item = cart.find(product => product.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
  saveCart();
  updateCartUI();
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}
function clearCart() {
  if (!cart.length) return;
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCart();
    updateCartUI();
  }
}
function updateCartUI() {
  document.querySelector(".cart-count").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  const container = document.getElementById("cartItems");
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span aria-hidden="true" style="font-size:30px">${item.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">−</button>
            <input value="${item.quantity}" readonly aria-label="Quantity">
            <button onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>`).join("");
  }
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.10;
  document.getElementById("subtotal").textContent = formatMoney(subtotal);
  document.getElementById("tax").textContent = formatMoney(tax);
  document.getElementById("total").textContent = formatMoney(subtotal + tax);
}
function checkout() {
  if (!cart.length) { alert("Your cart is empty."); return; }
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert("Demo checkout only. Your total is " + formatMoney(subtotal * 1.10) + ". No payment was taken.");
}
function saveCart() { localStorage.setItem("shophub-cart", JSON.stringify(cart)); }
function formatMoney(amount) { return "$" + amount.toFixed(2); }
function scrollToProducts() { document.getElementById("products").scrollIntoView({ behavior: "smooth" }); }
