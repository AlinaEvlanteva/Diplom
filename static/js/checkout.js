// Валидация телефона (простая версия)
function validatePhoneSimple(phone) {
    // Убираем все нецифровые символы
    const digits = phone.replace(/[^0-9]/g, '');
    // Проверяем длину: 10 или 11 цифр
    const isValidLength = digits.length === 10 || digits.length === 11;
    
    // Проверяем, что если 11 цифр, то начинается с 7 или 8
    let startsCorrect = true;
    if (digits.length === 11) {
        startsCorrect = digits.startsWith('7') || digits.startsWith('8');
    }
    
    return isValidLength && startsCorrect;
}

// Показ уведомлений (оставим для ошибок)
function showFlashMessage(message, category) {
    let container = document.querySelector('.flash_messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash_messages';
        document.body.appendChild(container);
    }
    
    const flash = document.createElement('div');
    flash.className = `flash flash_${category}`;
    flash.textContent = message;
    
    container.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 5000);
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
        showFlashMessage('Пожалуйста, введите корректный номер телефона (10 или 11 цифр)', 'error');
        phoneInput.style.borderColor = '#dc3545';
        return;
    }
    
    // Сбрасываем стиль, если был красный
    phoneInput.style.borderColor = '#42546E';
    
    const formData = new FormData(this);
    
    fetch('/submit_request', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Открываем модальное окно успеха
            openSuccessModal();
        } else {
            showFlashMessage('❌ Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('❌ Ошибка при отправке заявки', 'error');
    });
});

// Проверка при вводе телефона (сбрасываем красную рамку)
document.getElementById('phoneInput')?.addEventListener('input', function(e) {
    this.style.borderColor = '#42546E';
});