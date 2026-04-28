from flask import jsonify
from . import api_bp
from .cart import get_cart

#API для получения количества товара в корзине
@api_bp.route('/api/cart_item_quantity/<int:product_id>')
def cart_item_quantity(product_id):
    cart = get_cart()
    product_key = str(product_id)
    quantity = cart.get(product_key, {}).get('quantity', 0)
    return jsonify({'quantity': quantity})

#API для получения общего количества товаров в корзине
@api_bp.route('/api/cart_count')
def cart_count():
    cart = get_cart()
    total_items = sum(item['quantity'] for item in cart.values())
    return jsonify({'total_items': total_items})