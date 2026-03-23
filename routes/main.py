from flask import render_template, request, redirect, url_for, flash, session, jsonify
from models import db
from models.product import Product, Category, Attribute, ProductAttribute
from models.user import User
from . import main_bp
import os
from werkzeug.utils import secure_filename

@main_bp.route('/')
def index():
    """Главная страница"""
    categories = Category.query.all()
    return render_template('main.html', categories=categories)

@main_bp.route('/catalog')
def catalog():
    """Страница каталога"""
    categories = Category.query.all()
    return render_template('katalog.html', categories=categories)

@main_bp.route('/category/<int:cat_id>')
def category_products(cat_id):
    """Страница категории с товарами"""
    category = Category.query.get_or_404(cat_id)
    products = Product.query.filter_by(category_id=cat_id).all()
    return render_template('kat_tovars.html', category=category, products=products)

@main_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    attributes = ProductAttribute.query.filter_by(product_id=product_id).all()
    
    # Добавьте для счетчика корзины
    cart = get_cart()
    total_cart_items = sum(item['quantity'] for item in cart.values())
    
    return render_template('tovars_detali.html', 
                         product=product, 
                         attributes=attributes,
                         total_cart_items=total_cart_items)

# ========== КОРЗИНА ==========

def get_cart():
    """Получить корзину из сессии"""
    return session.get('cart', {})

def save_cart(cart):
    """Сохранить корзину в сессию"""
    session['cart'] = cart

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
            'image': product.image
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
    total_sum = sum(item['price'] * item['quantity'] for item in cart_items)
    total_items = sum(item['quantity'] for item in cart_items)
    
    return render_template('cart.html',
                         cart_items=cart_items,
                         total_sum=total_sum,
                         total_items=total_items)

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
    
    # Если запрос через fetch, возвращаем JSON
    if request.method == 'POST':
        return jsonify({'success': True})
    
    # Если GET (через ссылку), перенаправляем
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

