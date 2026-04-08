// обратная связь главная страница

function openFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    document.getElementById('feedbackForm').reset();
}

function validatePhone(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length !== 11) return false;
    const firstDigit = digits[0];
    if (firstDigit !== '7' && firstDigit !== '8') return false;
    const operatorCode = digits.substring(1, 4);
    if (operatorCode[0] === '0' || operatorCode[0] === '1') return false;
    return true;
}

// Форматирование тел при вводе
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

document.getElementById('feedbackForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('feedbackPhone');
    const phone = phoneInput.value;
    
    if (!validatePhone(phone)) {
        showFlashMessage('❌ Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX', 'error');
        phoneInput.style.border = '2px solid #dc3545'; 
        phoneInput.focus();
        return;
    }
    
    phoneInput.style.borderColor = '#42546E';
    const formData = new FormData(this);
    closeFeedbackModal();
    
    // const submitBtn = this.querySelector('button[type="submit"]');
    // const originalText = submitBtn.textContent;
    // submitBtn.textContent = 'Отправка...';
    // submitBtn.disabled = true;
    
    showFlashMessage('📩 Отправляем заявку...', 'info');
    
    fetch('/send_feedback', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
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
    // .finally(() => {
    //     submitBtn.textContent = originalText;
    //     submitBtn.disabled = false;
    // });
});

const phoneInput = document.getElementById('feedbackPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        formatPhone(this);
        this.style.borderColor = '#42546E';
    });
}

console.log('feedback.js загружен');