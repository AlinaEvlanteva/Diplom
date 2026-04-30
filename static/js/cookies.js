document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie_banner');
    if (!banner) return;
    
    const alreadyAccepted = localStorage.getItem('cookiesAccepted');
    
    if (alreadyAccepted === 'true') {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'flex';
    }
    
    const acceptBtn = document.getElementById('accept_cookies');
    if (acceptBtn) {
        acceptBtn.onclick = function() {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.style.display = 'none';
        };
    }
});