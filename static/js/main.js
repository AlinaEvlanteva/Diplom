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

function updateCartCounter(totalItems) {
    const cartCount = document.getElementById('cart_count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.classList.add('visible');
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.remove('visible');
            cartCount.classList.add('hidden');
        }
    }
}

// При загрузке страницы проверяем
document.addEventListener('DOMContentLoaded', function() {
    const cartCount = document.getElementById('cart_count');
    if (cartCount) {
        const count = parseInt(cartCount.textContent) || 0;
        if (count > 0) {
            cartCount.classList.add('visible');
        }
    }
    
    // Проверяем состояние счетчика на странице товара
    const productActions = document.querySelector('.product_actions');
    if (productActions) {
        const addBtn = productActions.querySelector('.but_add_cart');
        const quantitySelector = productActions.querySelector('.quantity_selector');
        
        if (addBtn && quantitySelector) {
            const productId = addBtn.dataset.productId;
            
            fetch(`/api/cart_item_quantity/${productId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.quantity > 0) {
                        addBtn.style.display = 'none';
                        quantitySelector.style.display = 'flex';
                        const qtySpan = quantitySelector.querySelector('.value');
                        if (qtySpan) qtySpan.textContent = data.quantity;
                    } else {
                        addBtn.style.display = 'block';
                        quantitySelector.style.display = 'none';
                    }
                })
                .catch(error => console.error('Ошибка проверки корзины:', error));
        }
    }
});

// ===== ОБРАБОТЧИК ВОЗВРАТА ЧЕРЕЗ СТРЕЛКУ "НАЗАД" =====
window.addEventListener('pageshow', function(event) {
    // Проверяем, загружена ли страница из кэша (при нажатии "назад")
    if (event.persisted) {
        console.log('Страница загружена из кэша (нажата стрелка назад)');
        
        // Обновляем общий счетчик корзины в хедере
        fetch('/api/cart_count')
            .then(r => r.json())
            .then(data => updateCartCounter(data.total_items))
            .catch(error => console.error('Ошибка обновления счетчика:', error));
        
        // Обновляем состояние счетчика на странице товара
        const productActions = document.querySelector('.product_actions');
        if (productActions) {
            const addBtn = productActions.querySelector('.but_add_cart');
            const quantitySelector = productActions.querySelector('.quantity_selector');
            
            if (addBtn && quantitySelector) {
                const productId = addBtn.dataset.productId;
                
                fetch(`/api/cart_item_quantity/${productId}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.quantity > 0) {
                            addBtn.style.display = 'none';
                            quantitySelector.style.display = 'flex';
                            const qtySpan = quantitySelector.querySelector('.value');
                            if (qtySpan) qtySpan.textContent = data.quantity;
                        } else {
                            addBtn.style.display = 'block';
                            quantitySelector.style.display = 'none';
                        }
                    })
                    .catch(error => console.error('Ошибка проверки корзины:', error));
            }
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
    const checkboxes = document.querySelectorAll('.item_checkbox');
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
}

// Удалить выбранные
function deleteSelected() {
    const selected = [];
    document.querySelectorAll('.item_checkbox:checked').forEach(cb => {
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

// ===== СЧЕТЧИК КОЛИЧЕСТВА НА СТРАНИЦЕ ТОВАРА =====

// Функция для получения количества товара в корзине
function getCartItemQuantity(productId) {
    return fetch(`/api/cart_item_quantity/${productId}`)
        .then(response => response.json())
        .then(data => data.quantity || 0);
}

// Функция для обновления количества на сервере
function updateCartItemQuantity(productId, quantity) {
    return fetch(`/update_cart/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `quantity=${quantity}`
    });
}

// Инициализация селектора количества для каждого товара
document.querySelectorAll('.product_actions').forEach(container => {
    const addBtn = container.querySelector('.but_add_cart');
    const quantitySelector = container.querySelector('.quantity_selector');
    const qtySpan = quantitySelector?.querySelector('.value');
    const minusBtn = quantitySelector?.querySelector('.minus');
    const plusBtn = quantitySelector?.querySelector('.plus');
    
    if (!addBtn || !quantitySelector) return;
    
    const productId = addBtn.dataset.productId;
    
    // Проверяем, сколько товара уже в корзине
    getCartItemQuantity(productId).then(quantity => {
        if (quantity > 0) {
            // Если есть — показываем селектор, прячем кнопку
            addBtn.style.display = 'none';
            quantitySelector.style.display = 'flex';
            qtySpan.textContent = quantity;
        }
    });
    
    // Обработчик кнопки "Заказать"
    addBtn.addEventListener('click', () => {
        fetch(`/add_to_cart/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCounter(data.total_items);
                // Прячем кнопку, показываем селектор
                addBtn.style.display = 'none';
                quantitySelector.style.display = 'flex';
                qtySpan.textContent = '1';
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
    
    // Обработчик кнопки "-"
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            let qty = parseInt(qtySpan.textContent);
            if (qty > 1) {
                qty--;
                // Ждем ответа от сервера, чтобы обновить счетчик
                fetch(`/update_cart/${productId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `quantity=${qty}`
                })
                .then(() => {
                    qtySpan.textContent = qty;
                    // После обновления корзины — запрашиваем новое общее количество
                    return fetch('/api/cart_count');
                })
                .then(r => r.json())
                .then(data => updateCartCounter(data.total_items))
                .catch(error => console.error('Ошибка:', error));
            } else if (qty === 1) {
                // Удаляем товар
                fetch(`/remove_from_cart/${productId}`, { method: 'POST' })
                .then(() => {
                    quantitySelector.style.display = 'none';
                    addBtn.style.display = 'block';
                    return fetch('/api/cart_count');
                })
                .then(r => r.json())
                .then(data => updateCartCounter(data.total_items))
                .catch(error => console.error('Ошибка:', error));
            }
        });
    }
    
    // Обработчик кнопки "+"
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            let qty = parseInt(qtySpan.textContent);
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
            .catch(error => console.error('Ошибка:', error));
        });
    }
});

// ===== ОБРАТНАЯ СВЯЗЬ (БЕЗ БД) =====

function openFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    document.getElementById('feedbackForm').reset();
}

// Валидация телефона
function validatePhone(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    return digits.length === 10 || digits.length === 11;
}

// Отправка формы обратной связи
// Отправка формы обратной связи
document.getElementById('feedbackForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('Форма отправлена');  // ← для отладки
    
    const phoneInput = document.getElementById('feedbackPhone');
    const phone = phoneInput.value;
    
    console.log('Телефон:', phone);  // ← для отладки
    
    if (!validatePhone(phone)) {
        showFlashMessage('Пожалуйста, введите корректный номер телефона (10 или 11 цифр)', 'error');
        phoneInput.style.borderColor = '#dc3545';
        return;
    }
    
    phoneInput.style.borderColor = '#42546E';
    
    const formData = new FormData(this);
    
    console.log('Отправка запроса...');  // ← для отладки
    
    fetch('/send_feedback', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Ответ получен, статус:', response.status);  // ← для отладки
        return response.json();
    })
    .then(data => {
        console.log('Данные ответа:', data);  // ← для отладки
        if (data.success) {
            showFlashMessage('✅ Сообщение отправлено! Менеджер свяжется с вами.', 'success');
            closeFeedbackModal();
        } else {
            showFlashMessage('❌ Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);  // ← для отладки
        showFlashMessage('❌ Ошибка при отправке', 'error');
    });
});


// ===== FLASH СООБЩЕНИЯ =====
function showFlashMessage(message, category) {
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }
    
    const flash = document.createElement('div');
    flash.className = `flash flash-${category}`;
    flash.textContent = message;
    
    container.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 5000);
}

console.log('main.js загружен');