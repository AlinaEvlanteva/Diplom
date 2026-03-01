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
    // Переключаем активный класс у кнопок
    document.querySelectorAll('.nav_log').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Переключаем содержимое
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

// Закрытие по клику вне окна
window.onclick = function(event) {
    var modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Функции отправки форм
// function submitLogin(event) {
//     event.preventDefault();
//     var formData = new FormData(event.target);
    
//     fetch('/auth/login', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert(data.message);
//             location.reload();
//         } else {
//             alert(data.message);
//         }
//     });
// }

// function submitRegister(event) {
//     event.preventDefault();
//     var formData = new FormData(event.target);
    
//     fetch('/auth/register', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert(data.message);
//             location.reload();
//         } else {
//             alert(data.message);
//         }
//     });
// }
// function submitLogin(event) {
//     event.preventDefault();
//     var formData = new FormData(event.target);
    
//     fetch('/auth/login', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert(data.message);
//             closeModal();
//             location.reload();  // перезагружаем страницу
//         } else {
//             alert('Ошибка: ' + data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Произошла ошибка при входе');
//     });
// }

// function submitRegister(event) {
//     event.preventDefault();
//     var formData = new FormData(event.target);
    
//     fetch('/auth/register', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert(data.message);
//             closeModal();
//             location.reload();  // перезагружаем страницу
//         } else {
//             alert('Ошибка: ' + data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Произошла ошибка при регистрации');
//     });
// }
function submitLogin(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    
    fetch('/auth/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showSuccess('Вход выполнен', 'Состав корзины мог измениться. Проверьте свои товары');
            setTimeout(() => location.reload(), 1500);
        } else {
            showError('Ошибка входа', data.message);
        }
    });
}

function submitRegister(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    
    fetch('/auth/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showSuccess('Регистрация выполнена', 'Пожалуйста, войдите в аккаунт');
            setTimeout(() => location.reload(), 1500);
        } else {
            showError('Ошибка регистрации', data.message);
        }
    });
}

// Функция для выхода
function logoutUser() {
    fetch('/auth/logout')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showInfo('Выход выполнен', 'Вы вышли из аккаунта');
            // Перенаправляем на главную через секунду
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
    });
}

// Функция для показа уведомления
function showNotification(title, message, type = 'info', buttonText = null, buttonAction = null) {
    const container = document.getElementById('notificationContainer');
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Содержимое уведомления
    let html = `
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    // Добавляем кнопку, если есть
    if (buttonText && buttonAction) {
        html += `<button class="notification-button" onclick="${buttonAction}">${buttonText}</button>`;
    }
    
    notification.innerHTML = html;
    
    // Добавляем в контейнер
    container.appendChild(notification);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Функция для разных типов уведомлений
function showSuccess(title, message, buttonText = null, buttonAction = null) {
    showNotification(title, message, 'success', buttonText, buttonAction);
}

function showError(title, message) {
    showNotification(title, message, 'error');
}

function showInfo(title, message) {
    showNotification(title, message, 'info');
}

function showWarning(title, message) {
    showNotification(title, message, 'warning');
}