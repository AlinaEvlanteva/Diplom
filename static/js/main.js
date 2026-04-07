// ========== КОРЗИНА ==========

// Обработчик для кнопки "Заказать" на странице товара
document.querySelectorAll('.but_add_cart').forEach(btn => {
    btn.addEventListener('click', function() {
        const productId = this.dataset.productId;
        
        fetch(`/add_to_cart/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
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
        const totalItems = parseInt(cartCount.textContent) || 0;
        // if (count > 0) {
        //     cartCount.classList.add('visible');
        // } 
        updateCartCounter(totalItems);
        
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
    if (event.persisted) {
        console.log('Страница загружена из кэша (нажата стрелка назад)');
        
        fetch('/api/cart_count')
            .then(r => r.json())
            .then(data => updateCartCounter(data.total_items))
            .catch(error => console.error('Ошибка обновления счетчика:', error));
        
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
        return;
    }
    
    fetch('/remove_selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selected })
    })
    .then(response => response.json())
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
    fetch(`/api/cart_item_quantity/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.quantity > 0) {
                addBtn.style.display = 'none';
                quantitySelector.style.display = 'flex';
                qtySpan.textContent = data.quantity;
            }
        })
        .catch(error => console.error('Ошибка:', error));
    
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
            } else if (qty === 1) {
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

// ===== ОБРАТНАЯ СВЯЗЬ =====

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
    if (digits.length !== 11) return false;
    const firstDigit = digits[0];
    if (firstDigit !== '7' && firstDigit !== '8') return false;
    const operatorCode = digits.substring(1, 4);
    if (operatorCode[0] === '0' || operatorCode[0] === '1') return false;
    return true;
}

// Форматирование телефона при вводе
function formatPhone(input) {
    let digits = input.value.replace(/[^0-9]/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length > 0 && digits[0] === '8') digits = '7' + digits.slice(1);
    
    if (digits.length === 0) {
        input.value = '';
    } else if (digits.length <= 1) {
        input.value = '+' + digits;
    } else if (digits.length <= 4) {
        input.value = '+' + digits.slice(0, 1) + ' (' + digits.slice(1);
    } else if (digits.length <= 7) {
        input.value = '+' + digits.slice(0, 1) + ' (' + digits.slice(1, 4) + ') ' + digits.slice(4);
    } else if (digits.length <= 9) {
        input.value = '+' + digits.slice(0, 1) + ' (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
    } else {
        input.value = '+' + digits.slice(0, 1) + ' (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7, 9) + '-' + digits.slice(9, 11);
    }
}

// Отправка формы обратной связи
document.getElementById('feedbackForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('feedbackPhone');
    const phone = phoneInput.value;
    
    if (!validatePhone(phone)) {
        showFlashMessage('❌ Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX', 'error');
        phoneInput.style.borderColor = '#dc3545';
        phoneInput.focus();
        return;
    }
    
    phoneInput.style.borderColor = '#42546E';
    const formData = new FormData(this);
    closeFeedbackModal();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    showFlashMessage('📩 Отправляем заявку...', 'info');
    
    fetch('/send_feedback', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFlashMessage('✅ Заявка отправлена! Менеджер свяжется с вами.', 'success');
        } else {
            showFlashMessage('❌ Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('❌ Ошибка при отправке. Попробуйте позже.', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Добавляем форматирование при вводе
const phoneInput = document.getElementById('feedbackPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        formatPhone(this);
        this.style.borderColor = '#42546E';
    });
}

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
    }, 3000);
}

// ===== АНИМАЦИЯ ПРИ СКРОЛЛЕ =====
function checkVisibility() {
    const elements = document.querySelectorAll('.advantages_post');
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top <= windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkVisibility);
window.addEventListener('load', checkVisibility);

console.log('main.js загружен');