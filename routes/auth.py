from flask import render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from . import auth_bp

@auth_bp.route('/login')
def login():
    """Страница входа (временная заглушка)"""
    return "Страница входа будет позже"

@auth_bp.route('/logout')
def logout():
    """Выход (временная заглушка)"""
    return redirect(url_for('main.index'))