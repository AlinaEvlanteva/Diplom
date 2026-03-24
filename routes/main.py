from flask import render_template, request, redirect, url_for, flash, session, jsonify
from models import db
from models.product import Product, Category, Attribute, ProductAttribute
from models.user import User
from . import main_bp
import os
from werkzeug.utils import secure_filename
from models.request import Request
from models.request_item import RequestItem

@main_bp.route('/submit_request', methods=['POST'])
def submit_request():
    """Оформление заявки с корзиной"""
    try:
        name = request.form.get('name')
        phone = request.form.get('phone')
        comment = request.form.get('comment', '')
        consent = request.form.get('consent') == 'on'
        
        # Получаем корзину из сессии
        cart = get_cart()
        
        if not cart:
            return jsonify({'success': False, 'error': 'Корзина пуста'})
        
        if not consent:
            return jsonify({'success': False, 'error': 'Необходимо согласие на обработку данных'})
        
        # Рассчитываем сумму
        total_sum = sum(item['price'] * item['quantity'] for item in cart.values())
        
        # Создаем заявку
        new_request = Request(
            name=name,
            phone=phone,
            comment=comment,
            total_sum=total_sum,
            consent=consent
        )
        db.session.add(new_request)
        db.session.flush()  # чтобы получить id
        
        # Добавляем товары в заявку
        for item in cart.values():
            request_item = RequestItem(
                request_id=new_request.id,
                product_id=item['id'],
                quantity=item['quantity']
            )
            db.session.add(request_item)
        
        db.session.commit()
        
        # Очищаем корзину
        session.pop('cart', None)
        
        return jsonify({'success': True, 'request_id': new_request.id})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})


@main_bp.route('/checkout')
def checkout():
    """Страница оформления заявки"""
    cart = get_cart()
    cart_items = list(cart.values())
    
    if not cart_items:
        flash('Корзина пуста', 'error')
        return redirect(url_for('main.cart_page'))
    
    total_sum = sum(item['price'] * item['quantity'] for item in cart_items)
    total_items = sum(item['quantity'] for item in cart_items)
    
    return render_template('checkout.html',
                         cart_items=cart_items,
                         total_sum=total_sum,
                         total_items=total_items,
                         total_cart_items=total_items)
# ========== КОРЗИНА ==========

def get_cart():
    """Получить корзину из сессии"""
    return session.get('cart', {})

def save_cart(cart):
    """Сохранить корзину в сессию"""
    session['cart'] = cart

def get_cart_count():
    """Получить количество товаров в корзине"""
    cart = get_cart()
    return sum(item['quantity'] for item in cart.values())

@main_bp.route('/')
def index():
    """Главная страница"""
    categories = Category.query.all()
    total_cart_items = get_cart_count()
    return render_template('main.html', categories=categories, total_cart_items=total_cart_items)

@main_bp.route('/catalog')
def catalog():
    """Страница каталога"""
    categories = Category.query.all()
    total_cart_items = get_cart_count()
    return render_template('katalog.html', categories=categories, total_cart_items=total_cart_items)

@main_bp.route('/category/<int:cat_id>')
def category_products(cat_id):
    """Страница категории с товарами"""
    category = Category.query.get_or_404(cat_id)
    products = Product.query.filter_by(category_id=cat_id).all()
    total_cart_items = get_cart_count()
    return render_template('kat_tovars.html', category=category, products=products, total_cart_items=total_cart_items)

@main_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    """Страница отдельного товара"""
    product = Product.query.get_or_404(product_id)
    attributes = ProductAttribute.query.filter_by(product_id=product_id).all()
    total_cart_items = get_cart_count()
    
    return render_template('tovars_detali.html', 
                         product=product, 
                         attributes=attributes,
                         total_cart_items=total_cart_items)

@main_bp.route('/add_to_cart/<int:product_id>', methods=['POST'])
def add_to_cart(product_id):
    """Добавить товар в корзину"""
    product = Product.query.get_or_404(product_id)
    
    cart = get_cart()
    product_key = str(product_id)
    
    if product_key in cart:
        cart[product_key]['quantity'] += 1
    else:
        cart[product_key] = {
            'id': product.id,
            'name': product.name,
            'article': product.article,
            'price': float(product.price),
            'quantity': 1,
            'image': product.image,
            'unit': product.unit or 'шт'   # ← ДОБАВЬ ЭТУ СТРОКУ
        }
    
    save_cart(cart)
    
    total_items = sum(item['quantity'] for item in cart.values())
    
    return jsonify({
        'success': True,
        'total_items': total_items,
        'message': f'{product.name} добавлен в корзину'
    })

@main_bp.route('/cart')
def cart_page():
    """Страница корзины"""
    cart = get_cart()
    cart_items = list(cart.values())
    
    # Для старых товаров, у которых нет unit
    for item in cart_items:
        if 'unit' not in item:
            product = Product.query.get(item['id'])
            item['unit'] = product.unit or 'шт' if product else 'шт'
    
    total_sum = sum(item['price'] * item['quantity'] for item in cart_items)
    total_items = sum(item['quantity'] for item in cart_items)
    
    return render_template('cart.html',
                         cart_items=cart_items,
                         total_sum=total_sum,
                         total_items=total_items,
                         total_cart_items=total_items)

@main_bp.route('/update_cart/<int:product_id>', methods=['POST'])
def update_cart(product_id):
    """Обновить количество"""
    cart = get_cart()
    product_key = str(product_id)
    quantity = int(request.form.get('quantity', 0))
    
    if product_key in cart:
        if quantity <= 0:
            del cart[product_key]
        else:
            cart[product_key]['quantity'] = quantity
    
    save_cart(cart)
    return redirect(url_for('main.cart_page'))

@main_bp.route('/remove_from_cart/<int:product_id>', methods=['POST', 'GET'])
def remove_from_cart(product_id):
    """Удалить из корзины"""
    cart = get_cart()
    product_key = str(product_id)
    
    if product_key in cart:
        del cart[product_key]
    
    save_cart(cart)
    
    if request.method == 'POST':
        return jsonify({'success': True})
    
    return redirect(url_for('main.cart_page'))

@main_bp.route('/remove_selected', methods=['POST'])
def remove_selected():
    """Удалить выбранные товары из корзины"""
    data = request.get_json()
    product_ids = data.get('product_ids', [])
    
    cart = get_cart()
    
    for product_id in product_ids:
        product_key = str(product_id)
        if product_key in cart:
            del cart[product_key]
    
    save_cart(cart)
    
    return jsonify({'success': True, 'count': len(product_ids)})


@main_bp.route('/api/cart_item_quantity/<int:product_id>')
def api_cart_item_quantity(product_id):
    """API для получения количества товара в корзине"""
    cart = get_cart()
    product_key = str(product_id)
    quantity = cart.get(product_key, {}).get('quantity', 0)
    return jsonify({'quantity': quantity})

@main_bp.route('/api/cart_count')
def api_cart_count():
    """API для получения общего количества товаров в корзине"""
    cart = get_cart()
    total_items = sum(item['quantity'] for item in cart.values())
    return jsonify({'total_items': total_items})