
function goToHome() {
    window.location.href = '/';
}

// УНИВЕРСАЛЬНОЕ ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// ВАЛИДАЦИЯ ТЕЛЕФОНА (ЕДИНАЯ)
function validatePhone(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length !== 11) return false;
    const firstDigit = digits[0];
    if (firstDigit !== '7' && firstDigit !== '8') return false;
    const operatorCode = digits.substring(1, 4);
    if (operatorCode[0] === '0' || operatorCode[0] === '1') return false;
    return true;
}

// ФОРМАТИРОВАНИЕ ТЕЛЕФОНА (ЕДИНАЯ) 
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

// 4. ЗАПРЕТ ВВОДА ЦИФР В ПОЛЕ ИМЕНИ 
const nameInputBlock = document.getElementById('feedbackName');
if (nameInputBlock) {
    nameInputBlock.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^A-Za-zА-Яа-яёЁ\s-]/g, '');
        this.style.borderColor = '#42546E';
    });
}


document.getElementById('feedbackForm')?.addEventListener('submit', function(e) {
    e.preventDefault();  
    const phoneInput = document.getElementById('feedbackPhone');
    const phone = phoneInput.value;
    
    if (!validatePhone(phone)) {
        showFlashMessage('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX', 'error');
        phoneInput.style.border = '2px solid #dc3545'; 
        phoneInput.focus();
        return;
    }
    
    phoneInput.style.borderColor = '#42546E';
    const formData = new FormData(this);
    closeModal('feedbackModal');
    document.getElementById('feedbackForm').reset();
    
    showFlashMessage('Отправляем заявку...', 'info');
    
    fetch('/send_feedback', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showFlashMessage('Заявка отправлена! Менеджер свяжется с вами.', 'success');
        } else {
            showFlashMessage('Произошла ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('Ошибка при отправке. Попробуйте позже.', 'error');
    })
});

//ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ДЛЯ FEEDBACK
const phoneInput = document.getElementById('feedbackPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        formatPhone(this);
        this.style.borderColor = '#42546E';
    });
}


document.getElementById('checkoutForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
     
    // Проверяем имя
    // const nameInput = document.getElementById('checkoutName');
    // if (!nameInput || !nameInput.value.trim()) {
    //     showFlashMessage('Пожалуйста, представьтесь', 'error');
    //     if (nameInput) nameInput.style.border = '2px solid #dc3545';
    //     nameInput.focus();
    //     return;
    // }
    
    // Проверяем телефон
    const phoneInput = document.getElementById('checkoutPhone');
    const phone = phoneInput.value;

    if (!validatePhone(phone)) {
        showFlashMessage('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX', 'error');
        phoneInput.style.border = '2px solid #dc3545';
        phoneInput.focus();
        return;
    }
    
    // Восстанавливаем стиль
    // if (nameInput) nameInput.style.borderColor = '#42546E';
    phoneInput.style.borderColor = '#42546E';
    const formData = new FormData(this);
        
    fetch('/submit_request', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Закрываем модальное окно оформления заказа
            closeModal('checkoutModal');
            // Открываем модальное окно успеха
            openModal('successModal');
        } else {
            showFlashMessage('Произошла ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('Ошибка при отправке заявки', 'error');
    });
});

// Настройка форматирования телефона и валидации имени в модалке
document.addEventListener('DOMContentLoaded', function() {
    const checkoutPhone = document.getElementById('checkoutPhone');
    if (checkoutPhone) {
        checkoutPhone.addEventListener('input', function() {
            formatPhone(this);
            this.style.borderColor = '#42546E';
        });
    }
    
    const checkoutName = document.getElementById('checkoutName');
    if (checkoutName) {
        checkoutName.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-zА-Яа-яёЁ\s-]/g, '');
            this.style.borderColor = '#42546E';
        });
    }
});


console.log('application.js загружен');