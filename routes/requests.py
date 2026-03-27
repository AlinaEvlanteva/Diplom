from flask import session, jsonify, redirect, url_for, render_template, request
from models import db
from models.request import Request
from models.request_item import RequestItem
from . import requests_bp
from .cart import get_cart

@requests_bp.route('/submit_request', methods=['POST'])
def submit_request():
    """Оформление заявки с корзиной"""
    try:
        name = request.form.get('name')
        phone = request.form.get('phone')
        comment = request.form.get('comment', '')
        consent = request.form.get('consent') == 'on'
        
        cart = get_cart()
        
        if not cart:
            return jsonify({'success': False, 'error': 'Корзина пуста'})
        
        if not consent:
            return jsonify({'success': False, 'error': 'Необходимо согласие на обработку данных'})
        
        total_sum = sum(item['price'] * item['quantity'] for item in cart.values())
        
        new_request = Request(
            name=name,
            phone=phone,
            comment=comment,
            total_sum=total_sum,
            consent=consent
        )
        db.session.add(new_request)
        db.session.flush()
        
        for item in cart.values():
            request_item = RequestItem(
                request_id=new_request.id,
                product_id=item['id'],
                quantity=item['quantity']
            )
            db.session.add(request_item)
        
        db.session.commit()
        
        session.pop('cart', None)
        
        return jsonify({'success': True, 'request_id': new_request.id})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@requests_bp.route('/checkout')
def checkout():
    """Страница оформления заявки"""
    cart = get_cart()
    cart_items = list(cart.values())
    
    if not cart_items:
        return redirect(url_for('cart.cart_page'))
    
    total_sum = sum(item['price'] * item['quantity'] for item in cart_items)
    total_items = sum(item['quantity'] for item in cart_items)
    
    return render_template('checkout.html',
                         cart_items=cart_items,
                         total_sum=total_sum,
                         total_items=total_items,
                         total_cart_items=total_items)