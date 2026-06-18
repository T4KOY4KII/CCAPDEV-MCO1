// price range slider
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

function updatePrice() {
    priceValue.textContent =
        `₱${Number(priceRange.value).toLocaleString()}`;
}

priceRange.addEventListener("input", updatePrice);
updatePrice(); // Initial value