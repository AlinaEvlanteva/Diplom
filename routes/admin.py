from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from models import db
from models.product import Product, Category, Attribute
from models.user import User
from . import admin_bp
import os
from werkzeug.utils import secure_filename

# ========== НАСТРОЙКИ ЗАГРУЗКИ ФАЙЛОВ ==========
UPLOAD_FOLDER = os.path.join('static', 'img', 'small')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ========== МАРШРУТЫ ДЛЯ ВХОДА ==========
@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Страница входа в админку"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Ищем пользователя с ролью admin
        admin = User.query.filter_by(username=username, role='admin').first()
        
        # Проверяем пароль
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_logged_in'] = True
            session['admin_id'] = admin.id
            session['admin_username'] = admin.username
            flash('Вход выполнен успешно', 'success')
            return redirect(url_for('admin.admin_panel'))
        else:
            flash('Неверный логин или пароль', 'error')
    
    return render_template('admin_login.html')

@admin_bp.route('/logout')
def admin_logout():
    """Выход из админки"""
    session.clear()
    flash('Вы вышли из админки', 'info')
    return redirect(url_for('admin.admin_login'))

# ========== ГЛАВНАЯ АДМИНКИ ==========
@admin_bp.route('/')
def admin_panel():
    """Главная админ-панели"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    products = Product.query.all()
    categories = Category.query.all()
    attributes = Attribute.query.all()
    
    return render_template('admin_panel.html', 
                         products=products, 
                         categories=categories, 
                         attributes=attributes)

# ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========
@admin_bp.route('/add_product', methods=['POST'])
def add_product():
    """Добавление нового товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    name = request.form.get('name')
    article = request.form.get('article')
    category_id = request.form.get('category_id')
    price = request.form.get('price')
    unit = request.form.get('unit')
    short_specs = request.form.get('short_specs')
    
    # Обработка изображения
    image = 'default.png'
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image = filename
    
    new_product = Product(
        name=name,
        article=article,
        category_id=category_id,
        price=price,
        unit=unit,
        short_specs=short_specs,
        image=image
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    flash('Товар успешно добавлен', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/delete_product/<int:product_id>')
def delete_product(product_id):
    """Удаление товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    
    flash('Товар удален', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    """Редактирование товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.article = request.form.get('article')
        product.category_id = request.form.get('category_id')
        product.price = request.form.get('price')
        product.unit = request.form.get('unit')
        product.short_specs = request.form.get('short_specs')
        product.full_description = request.form.get('full_description')
        
        # Обработка изображения
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                product.image = filename
        
        db.session.commit()
        flash('Товар обновлен', 'success')
        return redirect(url_for('admin.admin_panel'))
    
    categories = Category.query.all()
    return render_template('edit_product.html', product=product, categories=categories)

# ========== УПРАВЛЕНИЕ КАТЕГОРИЯМИ ==========
@admin_bp.route('/add_category', methods=['POST'])
def add_category():
    """Добавление новой категории"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    name = request.form.get('name')
    
    # Обработка изображения
    image = 'default_category.png'
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image = filename
    
    new_category = Category(name=name, image=image)
    db.session.add(new_category)
    db.session.commit()
    
    flash('Категория успешно добавлена', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/delete_category/<int:category_id>')
def delete_category(category_id):
    """Удаление категории"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    
    flash('Категория удалена', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/edit_category/<int:category_id>', methods=['GET', 'POST'])
def edit_category(category_id):
    """Редактирование категории"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    category = Category.query.get_or_404(category_id)
    
    if request.method == 'POST':
        category.name = request.form.get('name')
        
        # Обработка изображения
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                category.image = filename
        
        db.session.commit()
        flash('Категория обновлена', 'success')
        return redirect(url_for('admin.admin_panel'))
    
    return render_template('edit_category.html', category=category)

# ========== УПРАВЛЕНИЕ ХАРАКТЕРИСТИКАМИ ==========
@admin_bp.route('/add_attribute', methods=['POST'])
def add_attribute():
    """Добавление новой характеристики"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    category_id = request.form.get('category_id')
    name = request.form.get('name')
    unit = request.form.get('unit')
    
    new_attribute = Attribute(
        category_id=category_id,
        name=name,
        unit=unit
    )
    db.session.add(new_attribute)
    db.session.commit()
    
    flash('Характеристика успешно добавлена', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/delete_attribute/<int:attribute_id>')
def delete_attribute(attribute_id):
    """Удаление характеристики"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    attribute = Attribute.query.get_or_404(attribute_id)
    db.session.delete(attribute)
    db.session.commit()
    
    flash('Характеристика удалена', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/edit_attribute/<int:attribute_id>', methods=['GET', 'POST'])
def edit_attribute(attribute_id):
    """Редактирование характеристики"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    attribute = Attribute.query.get_or_404(attribute_id)
    
    if request.method == 'POST':
        attribute.category_id = request.form.get('category_id')
        attribute.name = request.form.get('name')
        attribute.unit = request.form.get('unit')
        db.session.commit()
        flash('Характеристика обновлена', 'success')
        return redirect(url_for('admin.admin_panel'))
    
    categories = Category.query.all()
    return render_template('edit_attribute.html', attribute=attribute, categories=categories)