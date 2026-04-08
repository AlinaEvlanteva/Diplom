// ========== СТРАНИЦА КОРЗИНЫ ==========

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    document.querySelectorAll('.item_checkbox').forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
}

function deleteSelected() {
    const selected = [];
    document.querySelectorAll('.item_checkbox:checked').forEach(cb => {
        selected.push(cb.value);
    });
    
    if (selected.length === 0) return;
    
    fetch('/remove_selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selected })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showFlashMessage('Товары удалены', 'success');
            window.location.href = '/cart';
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('Ошибка при удалении', 'error');
    });
}

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