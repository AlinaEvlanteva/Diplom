// ========== СТРАНИЦА ТОВАРА ==========

function showQuantitySelector(addBtn, quantitySelector, qtySpan, quantity) {
    addBtn.style.display = 'none';
    quantitySelector.style.display = 'flex';
    if (qtySpan) qtySpan.textContent = quantity;
}

function showAddButton(addBtn, quantitySelector) {
    addBtn.style.display = 'block';
    quantitySelector.style.display = 'none';
}

function initProductPage(container) {
    const addBtn = container.querySelector('.but_add_cart');
    const quantitySelector = container.querySelector('.quantity_selector');
    const qtySpan = quantitySelector?.querySelector('.value');
    const minusBtn = quantitySelector?.querySelector('.minus');
    const plusBtn = quantitySelector?.querySelector('.plus');
    
    if (!addBtn || !quantitySelector) return;
    
    const productId = addBtn.dataset.productId;
    
    // Проверяем, сколько товара уже в корзине
    fetch(`/api/cart_item_quantity/${productId}`)
        .then(r => r.json())
        .then(data => {
            if (data.quantity > 0) {
                showQuantitySelector(addBtn, quantitySelector, qtySpan, data.quantity);
            } else {
                showAddButton(addBtn, quantitySelector);
            }
        })
        .catch(error => console.error('Ошибка проверки корзины:', error));
    
    // Обработчик кнопки "Заказать"
    addBtn.addEventListener('click', () => {
        fetch(`/add_to_cart/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                updateCartCounter(data.total_items);
                showQuantitySelector(addBtn, quantitySelector, qtySpan, '1');
            }
        })
        .catch(error => console.error('Ошибка добавления:', error));
    });
    
    // Обработчики кнопок +/-
    if (minusBtn) initMinusButton(minusBtn, productId, addBtn, quantitySelector, qtySpan);
    if (plusBtn) initPlusButton(plusBtn, productId, qtySpan);
}

function initMinusButton(minusBtn, productId, addBtn, quantitySelector, qtySpan) {
    minusBtn.addEventListener('click', () => {
        let qty = parseInt(qtySpan.textContent);
        if (isNaN(qty)) qty = 1;
        
        if (qty > 1) {
            qty--;
            fetch(`/update_cart/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `quantity=${qty}`
            })
            .then(() => {
                qtySpan.textContent = qty;
                return fetch('/api/cart_count');
            })
            .then(r => r.json())
            .then(data => updateCartCounter(data.total_items))
            .catch(error => console.error('Ошибка в - (уменьшение):', error));
        } else if (qty === 1) {
            fetch(`/remove_from_cart/${productId}`, { method: 'POST' })
            .then(() => {
                if (addBtn && quantitySelector) {
                    addBtn.style.display = 'block';
                    quantitySelector.style.display = 'none';
                }
                return fetch('/api/cart_count');
            })
            .then(r => r.json())
            .then(data => updateCartCounter(data.total_items))
            .catch(error => console.error('Ошибка в - (удаление):', error));
        }
    });
}

function initPlusButton(plusBtn, productId, qtySpan) {
    plusBtn.addEventListener('click', () => {
        let qty = parseInt(qtySpan.textContent);
        if (isNaN(qty)) qty = 1;
        qty++;
        
        fetch(`/update_cart/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `quantity=${qty}`
        })
        .then(() => {
            qtySpan.textContent = qty;
            return fetch('/api/cart_count');
        })
        .then(r => r.json())
        .then(data => updateCartCounter(data.total_items))
        .catch(error => console.error('Ошибка в +:', error));
    });
}

// Инициализация при загрузке страницы товара
document.addEventListener('DOMContentLoaded', function() {
    const productActions = document.querySelector('.product_actions');
    if (productActions) initProductPage(productActions);
});

// Обновляем страницу товара при возврате "Назад"
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        const productActions = document.querySelector('.product_actions');
        if (productActions) initProductPage(productActions);
    }
});

console.log('tovars_detali.js загружен');