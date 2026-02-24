from flask import render_template
from flask_login import login_required, current_user
from . import admin_bp

@admin_bp.route('/admin')
@login_required
def admin_panel():
    """Админ-панель (только для админов)"""
    if current_user.role != 'admin':
        return "Доступ запрещен", 403
    return "Админ-панель в разработке"