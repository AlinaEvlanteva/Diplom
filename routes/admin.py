from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from models import db
from models.product import Product, Category, Attribute, ProductAttribute  # ВАЖНО: все импорты вместе
from models.user import User
from . import admin_bp
import os
from werkzeug.utils import secure_filename

# ========== НАСТРОЙКИ ЗАГРУЗКИ ФАЙЛОВ ==========
UPLOAD_FOLDER_SMALL = os.path.join('static', 'img', 'small')
UPLOAD_FOLDER_BIG = os.path.join('static', 'img', 'big')
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
    
    # Получаем активную вкладку из сессии (по умолчанию 'categories')
    active_tab = session.get('active_tab', 'categories')
    
    return render_template('admin_panel.html', 
                         products=products, 
                         categories=categories, 
                         attributes=attributes,
                         active_tab=active_tab)

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
    image_big = 'default.png'
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Сохраняем в small
            small_path = os.path.join(UPLOAD_FOLDER_SMALL, filename)
            file.save(small_path)
            
            # Сохраняем в big (копируем из small)
            big_path = os.path.join(UPLOAD_FOLDER_BIG, filename)
            with open(small_path, 'rb') as src:
                with open(big_path, 'wb') as dst:
                    dst.write(src.read())
            
            image = filename
            image_big = filename
    
    # При добавлении old_price = None
    new_product = Product(
        name=name,
        article=article,
        category_id=category_id,
        price=price,
        unit=unit,
        short_specs=short_specs,
        image=image,
        image_big=image_big,
        old_price=None
    )
    
    db.session.add(new_product)
    db.session.commit()

    session['active_tab'] = 'products'
    
    flash('Товар успешно добавлен', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/delete_product/<int:product_id>')
def delete_product(product_id):
    """Удаление товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    product = Product.query.get_or_404(product_id)
    
    # Удаляем файлы изображений, если это не дефолтные
    if product.image and product.image != 'default.png':
        try:
            small_path = os.path.join(UPLOAD_FOLDER_SMALL, product.image)
            big_path = os.path.join(UPLOAD_FOLDER_BIG, product.image)
            
            if os.path.exists(small_path):
                os.remove(small_path)
            if os.path.exists(big_path):
                os.remove(big_path)
        except Exception as e:
            print(f"Ошибка при удалении файлов: {e}")
    
    db.session.delete(product)
    db.session.commit()

    session['active_tab'] = 'products'
    
    flash('Товар удален', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    """Редактирование товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'POST':
        # Получаем новую цену
        new_price = request.form.get('price')
        
        # Если цена изменилась, сохраняем старую
        if float(new_price) != float(product.price):
            product.old_price = product.price
        
        # Обновляем остальные поля
        product.name = request.form.get('name')
        product.article = request.form.get('article')
        product.category_id = request.form.get('category_id')
        product.price = new_price
        product.unit = request.form.get('unit')
        product.short_specs = request.form.get('short_specs')
        product.full_description = request.form.get('full_description')
        
        # Обработка изображения
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                
                # Сохраняем в small
                small_path = os.path.join(UPLOAD_FOLDER_SMALL, filename)
                file.save(small_path)
                
                # Сохраняем в big (копируем из small)
                big_path = os.path.join(UPLOAD_FOLDER_BIG, filename)
                with open(small_path, 'rb') as src:
                    with open(big_path, 'wb') as dst:
                        dst.write(src.read())
                
                product.image = filename
                product.image_big = filename
        
        db.session.commit()

        session['active_tab'] = 'products'

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
            file.save(os.path.join(UPLOAD_FOLDER_SMALL, filename))
            image = filename
    
    new_category = Category(name=name, image=image)
    db.session.add(new_category)
    db.session.commit()

    session['active_tab'] = 'categories'
    
    flash('Категория успешно добавлена', 'success')
    return redirect(url_for('admin.admin_panel'))

@admin_bp.route('/delete_category/<int:category_id>')
def delete_category(category_id):
    """Удаление категории"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    category = Category.query.get_or_404(category_id)
    
    # Удаляем файл изображения категории
    if category.image and category.image != 'default_category.png':
        try:
            img_path = os.path.join(UPLOAD_FOLDER_SMALL, category.image)
            if os.path.exists(img_path):
                os.remove(img_path)
        except Exception as e:
            print(f"Ошибка при удалении файла: {e}")
    
    db.session.delete(category)
    db.session.commit()

    session['active_tab'] = 'categories'
    
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
                file.save(os.path.join(UPLOAD_FOLDER_SMALL, filename))
                category.image = filename
        
        db.session.commit()

        session['active_tab'] = 'categories'

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
    
    # ИСПРАВЛЕНО: Сначала удаляем связанные значения, потом характеристику
    attribute = Attribute.query.get_or_404(attribute_id)
    
    # Удаляем все связанные значения из product_attributes
    ProductAttribute.query.filter_by(attribute_id=attribute_id).delete()
    
    # Теперь удаляем саму характеристику
    db.session.delete(attribute)
    db.session.commit()
    
    flash('Характеристика и все её значения удалены', 'success')
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

# ========== УПРАВЛЕНИЕ ЗНАЧЕНИЯМИ ХАРАКТЕРИСТИК ТОВАРОВ ==========
@admin_bp.route('/get_product_attributes/<int:product_id>')
def get_product_attributes(product_id):
    """Получение характеристик товара для модального окна"""
    if not session.get('admin_logged_in'):
        return {'error': 'Не авторизован'}, 403
    
    product = Product.query.get_or_404(product_id)
    
    # Получаем все характеристики для категории товара
    attributes = Attribute.query.filter_by(category_id=product.category_id).all()
    
    # Получаем текущие значения характеристик товара
    product_attrs = {pa.attribute_id: pa.value for pa in product.attributes}
    
    # Формируем данные для отправки
    attrs_data = []
    for attr in attributes:
        attrs_data.append({
            'id': attr.id,
            'name': attr.name,
            'unit': attr.unit,
            'value': product_attrs.get(attr.id, '')
        })
    
    return {
        'product_id': product.id,
        'product_name': product.name,
        'attributes': attrs_data
    }

@admin_bp.route('/product_attributes/<int:product_id>', methods=['GET', 'POST'])
def manage_product_attributes(product_id):
    """Управление значениями характеристик товара"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'POST':
        # Получаем все характеристики из формы
        for key, value in request.form.items():
            if key.startswith('attr_'):
                attr_id = int(key.replace('attr_', ''))
                # Проверяем, существует ли уже такая характеристика для товара
                existing = ProductAttribute.query.filter_by(
                    product_id=product_id, 
                    attribute_id=attr_id
                ).first()
                
                if existing:
                    # Обновляем существующее значение
                    existing.value = value
                else:
                    # Создаем новую запись
                    new_attr = ProductAttribute(
                        product_id=product_id,
                        attribute_id=attr_id,
                        value=value
                    )
                    db.session.add(new_attr)
        
        db.session.commit()
        flash('Характеристики товара обновлены', 'success')
        return redirect(url_for('admin.admin_panel'))
    
    # Получаем все характеристики для категории товара
    attributes = Attribute.query.filter_by(category_id=product.category_id).all()
    
    # Получаем текущие значения характеристик товара
    product_attrs = {pa.attribute_id: pa.value for pa in product.attributes}
    
    return render_template('manage_product_attributes.html', 
                         product=product, 
                         attributes=attributes,
                         product_attrs=product_attrs)

@admin_bp.route('/save_product_attributes', methods=['POST'])
def save_product_attributes():
    """Сохранение значений характеристик товара"""
    if not session.get('admin_logged_in'):
        return {'error': 'Не авторизован'}, 403
    
    data = request.get_json()
    product_id = data.get('product_id')
    attributes = data.get('attributes', {})
    
    try:
        for attr_id, value in attributes.items():
            if value:  # сохраняем только непустые значения
                # Проверяем, существует ли уже такая характеристика
                existing = ProductAttribute.query.filter_by(
                    product_id=product_id,
                    attribute_id=attr_id
                ).first()
                
                if existing:
                    existing.value = value
                else:
                    new_attr = ProductAttribute(
                        product_id=product_id,
                        attribute_id=attr_id,
                        value=value
                    )
                    db.session.add(new_attr)
        
        db.session.commit()
        return {'success': True, 'message': 'Характеристики сохранены'}
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500