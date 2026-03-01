# from flask import render_template, redirect, url_for, flash
# from flask_login import login_user, logout_user, login_required, current_user
# from . import auth_bp

# @auth_bp.route('/login')
# def login():
#     """Страница входа (временная заглушка)"""
#     return "Страница входа будет позже"

# @auth_bp.route('/logout')
# def logout():
#     """Выход (временная заглушка)"""
#     return redirect(url_for('main.index'))
from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from models import db
from . import auth_bp

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.form
    username = data.get('username')
    password = data.get('password')
    
    # Ищем пользователя
    user = User.query.filter_by(username=username).first()
    
    # Проверяем пароль
    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({'success': True, 'message': 'Успешный вход!'})
    else:
        return jsonify({'success': False, 'message': 'Неверное имя пользователя или пароль'})

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.form
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm = data.get('confirm_password')
    
    # Проверяем, что пароли совпадают
    if password != confirm:
        return jsonify({'success': False, 'message': 'Пароли не совпадают'})
    
    # Проверяем, не занят ли username
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Имя пользователя уже занято'})
    
    # Проверяем, не занят ли email
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email уже зарегистрирован'})
    
    # Создаем нового пользователя
    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role='user'
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Сразу логиним после регистрации
    login_user(new_user)
    
    return jsonify({'success': True, 'message': 'Регистрация успешна!'})

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Вы вышли из системы'})

@auth_bp.route('/profile')
@login_required
def profile():
    """Личный кабинет пользователя"""
    return render_template('profile.html')