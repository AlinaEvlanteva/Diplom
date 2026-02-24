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
            alert(data.message);
            location.reload();
        } else {
            alert(data.message);
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
            alert(data.message);
            location.reload();
        } else {
            alert(data.message);
        }
    });
}