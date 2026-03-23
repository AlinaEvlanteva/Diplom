// Функции для модального окна авторизации
function openModal() {
    console.log('openModal called');
    document.getElementById('authModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    switchTab('login');
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchTab(tab) {
    document.querySelectorAll('.nav_log').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab_content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.querySelector('.nav_log').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.querySelectorAll('.nav_log')[1].classList.add('active');
        document.getElementById('registerTab').classList.add('active');
    }
}

window.onclick = function(event) {
    var modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========== КОРЗИНА ==========

// Функция обновления счетчика
function updateCartCounter(totalItems) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    }
}

// При загрузке страницы проверяем начальное состояние
document.addEventListener('DOMContentLoaded', function() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const count = parseInt(cartCount.textContent) || 0;
        if (count === 0) {
            cartCount.classList.add('hidden');
        } else {
            cartCount.classList.remove('hidden');
        }
    }
});

// Обработчик для кнопки "Заказать" на странице товара (класс .but_add_cart)
document.querySelectorAll('.but_add_cart').forEach(btn => {
    btn.addEventListener('click', function() {
        const productId = this.dataset.productId;
        
        fetch(`/add_to_cart/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем счетчик
                updateCartCounter(data.total_items);
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
});

// Обработчик для кнопок с классом .add-to-cart-btn
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const productId = this.dataset.productId;
        
        fetch(`/add_to_cart/${productId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCounter(data.total_items);
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
});

function showNotification(message, type) {
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }
    
    const flash = document.createElement('div');
    flash.className = `flash flash-${type}`;
    flash.textContent = message;
    
    container.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 3000);
}

// Выбрать все товары
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
}

// Удалить выбранные
function deleteSelected() {
    const selected = [];
    document.querySelectorAll('.item-checkbox:checked').forEach(cb => {
        selected.push(cb.value);
    });
    
    if (selected.length === 0) {
        showNotification('Выберите товары для удаления', 'info');
        return;
    }
    
    fetch('/remove_selected', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_ids: selected })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Товары удалены', 'success');
            window.location.href = '/cart';
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Ошибка при удалении', 'error');
    });
}

// Обновить количество
function updateQuantity(productId, quantity) {
    if (quantity < 1) quantity = 1;
    
    fetch(`/update_cart/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `quantity=${quantity}`
    })
    .then(() => location.reload());
}

// Удалить один товар
function removeItem(productId) {
    fetch(`/remove_from_cart/${productId}`, { method: 'POST' })
        .then(() => location.reload());
}

console.log('main.js загружен');