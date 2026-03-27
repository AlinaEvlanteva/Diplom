from flask import session, jsonify, redirect, url_for, render_template, request
from models.product import Product
from . import cart_bp

# ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

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

# ========== МАРШРУТЫ КОРЗИНЫ ==========

@cart_bp.route('/add_to_cart/<int:product_id>', methods=['POST'])
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
            'unit': product.unit or 'шт'
        }
    
    save_cart(cart)
    
    total_items = sum(item['quantity'] for item in cart.values())
    
    return jsonify({
        'success': True,
        'total_items': total_items,
        'message': f'{product.name} добавлен в корзину'
    })

@cart_bp.route('/cart')
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

@cart_bp.route('/update_cart/<int:product_id>', methods=['POST'])
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
    return redirect(url_for('cart.cart_page'))

@cart_bp.route('/remove_from_cart/<int:product_id>', methods=['POST', 'GET'])
def remove_from_cart(product_id):
    """Удалить из корзины"""
    cart = get_cart()
    product_key = str(product_id)
    
    if product_key in cart:
        del cart[product_key]
    
    save_cart(cart)
    
    if request.method == 'POST':
        return jsonify({'success': True})
    
    return redirect(url_for('cart.cart_page'))

@cart_bp.route('/remove_selected', methods=['POST'])
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