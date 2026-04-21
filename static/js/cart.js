// ========== СТРАНИЦА КОРЗИНЫ ==========

function updateQuantity(productId, quantity) {
    if (quantity < 1) quantity = 1;
    fetch(`/update_cart/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `quantity=${quantity}`
    })
    .then(() => location.reload());
}

function removeItem(productId) {
    fetch(`/remove_from_cart/${productId}`, { method: 'POST' })
        .then(() => location.reload());
}

console.log('cart.js загружен');