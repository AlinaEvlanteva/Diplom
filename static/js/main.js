// функция обновления счетчика корзины на всех стр
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

// при загрузке страницы обновляем  корзину
document.addEventListener('DOMContentLoaded', function() {
    const cartCount = document.getElementById('cart_count');
    if (cartCount) {
        const totalItems = parseInt(cartCount.textContent) || 0;
        updateCartCounter(totalItems);
    }
});

// возврат по стрелке Назад
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        fetch('/api/cart_count')
            .then(r => r.json())
            .then(data => updateCartCounter(data.total_items))
            .catch(error => console.error('Ошибка обновления счетчика:', error));
    }
});

// сообщения 
function showFlashMessage(message, category) {
    let container = document.querySelector('.flash-messages');
   
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

// анимация при скролле ток главная
function checkVisibility() {
    document.querySelectorAll('.advantages_post').forEach(element => {
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