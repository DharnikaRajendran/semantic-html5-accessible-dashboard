
import { fetchProducts } from "./api.js";

const main = document.querySelector("main");

const explorer = document.createElement("section");
explorer.id = "product-explorer";

explorer.innerHTML = `
    <h2>Dynamic Product Explorer</h2>

    <input type="search" id="searchInput"
        placeholder="Search products..." aria-label="Search products">

    <div id="categoryTabs" aria-label="Product categories"></div>

    <label for="sortSelect">Sort by:</label>
    <select id="sortSelect">
        <option value="default">Default</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
    </select>

    <p id="loading" aria-live="polite">Loading products...</p>
    <div id="errorBanner" role="alert" hidden></div>
    <div id="productList"></div>
`;

main.appendChild(explorer);

const searchInput = document.getElementById("searchInput");
const categoryTabs = document.getElementById("categoryTabs");
const sortSelect = document.getElementById("sortSelect");
const productList = document.getElementById("productList");
const loading = document.getElementById("loading");
const errorBanner = document.getElementById("errorBanner");

let products = [];
let selectedCategory = "All";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function displayProducts() {
    let filtered = [...products];

    const searchText = searchInput.value.toLowerCase();

    filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchText)
    );

    if (selectedCategory !== "All") {
        filtered = filtered.filter(product =>
            product.category === selectedCategory
        );
    }

    if (sortSelect.value === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortSelect.value === "high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortSelect.value === "rating") {
        filtered.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    productList.innerHTML = "";

    if (filtered.length === 0) {
        productList.textContent = "No products found.";
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("p");
        price.textContent = `Price: $${product.price}`;

        const rating = document.createElement("p");
        rating.textContent = `Rating: ${product.rating.rate}/5`;

        const button = document.createElement("button");
        button.textContent = "Add to Cart";

        button.addEventListener("click", () => {
            cart.push(product.id);
            saveCart();
            button.textContent = "Added!";
        });

        card.append(title, price, rating, button);
        productList.appendChild(card);
    });
}

function createCategoryTabs() {
    const categories = [
        "All",
        ...new Set(products.map(product => product.category))
    ];

    categoryTabs.innerHTML = "";

    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category;

        button.addEventListener("click", () => {
            selectedCategory = category;
            displayProducts();
        });

        categoryTabs.appendChild(button);
    });
}

async function initializeApp() {
    loading.hidden = false;
productList.innerHTML = `
    <div class="product-card">Loading...</div>
    <div class="product-card">Loading...</div>
    <div class="product-card">Loading...</div>
`;
    errorBanner.hidden = true;

    try {
        products = await fetchProducts();
        createCategoryTabs();
        displayProducts();
    } catch (error) {
        errorBanner.textContent =
            "Products could not be loaded. Please try again.";
        errorBanner.hidden = false;
    } finally {
        loading.hidden = true;
    }
}

searchInput.addEventListener("input", displayProducts);
sortSelect.addEventListener("change", displayProducts);

initializeApp();
