// ===== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА =====
function formatPhoneCheckout(input) {
    // Убираем все нецифровые символы
    let digits = input.value.replace(/[^0-9]/g, '');
    
    // Ограничиваем длину 11 цифрами
    if (digits.length > 11) {
        digits = digits.slice(0, 11);
    }
    
    // Если первая цифра 8 - заменяем на 7
    if (digits.length > 0 && digits[0] === '8') {
        digits = '7' + digits.slice(1);
    }
    
    // Форматируем
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

// ===== ВАЛИДАЦИЯ ТЕЛЕФОНА (СТРОГАЯ, КАК В ОБРАТНОЙ СВЯЗИ) =====
function validatePhoneSimple(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    
    if (digits.length !== 11) return false;
    
    // Первая цифра должна быть 7 или 8
    const firstDigit = digits[0];
    if (firstDigit !== '7' && firstDigit !== '8') return false;
    
    // Код оператора (2-4 цифры) не может начинаться с 0 или 1
    const operatorCode = digits.substring(1, 4);
    if (operatorCode[0] === '0' || operatorCode[0] === '1') return false;
    
    return true;
}

// Показ уведомлений
function showFlashMessage(message, category) {
    let container = document.querySelector('.flash-messages');
    // if (!container) {
    //     container = document.createElement('div');
    //     container.className = 'flash-messages';
    //     document.body.appendChild(container);
    // }
    
    const flash = document.createElement('div');
    // Исправлено: flash-${category} вместо flash_${category}
    flash.className = `flash flash-${category}`;
    flash.textContent = message;
    
    container.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 3000);
}

// Открыть модальное окно успеха
function openSuccessModal() {
    document.getElementById('successModal').style.display = 'flex';
}

// Закрыть модальное окно успеха
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Перейти на главную
function goToHome() {
    window.location.href = '/';
}

// Отправка формы заявки
document.getElementById('requestForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value;
    
    // Валидация телефона
    if (!validatePhoneSimple(phone)) {
        showFlashMessage('❌ Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX', 'error');
        phoneInput.style.border = '2px solid #dc3545'; 
        phoneInput.focus();
        return;
    }
    
    // Сбрасываем стиль, если был красный
    phoneInput.style.borderColor = '#42546E';
    
    const formData = new FormData(this);
    // const submitBtn = this.querySelector('button[type="submit"]');
    // const originalText = submitBtn.textContent;
    
    // Блокируем кнопку
    // submitBtn.textContent = 'Отправка...';
    // submitBtn.disabled = true;
    
    fetch('/submit_request', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            openSuccessModal();
        } else {
            showFlashMessage('❌ Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('❌ Ошибка при отправке заявки', 'error');
    })
    // .finally(() => {
        // Разблокируем кнопку
    //     submitBtn.textContent = originalText;
    //     submitBtn.disabled = false;
    // });
});

// Проверка при вводе телефона (сбрасываем красную рамку)
document.getElementById('phoneInput')?.addEventListener('input', function(e) {
    this.style.borderColor = '#42546E';
});

// Инициализация форматирования телефона при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneCheckout(this);
            this.style.borderColor = '#42546E';
        });
    }
});