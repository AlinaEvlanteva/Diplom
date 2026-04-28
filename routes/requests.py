from flask import session, jsonify, redirect, url_for, render_template, request
from models import db
from models.request import Request
from models.request_item import RequestItem
from . import requests_bp
from .cart import get_cart

#ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ СОРТИРОВКИ
def get_order(item):
    """Вспомогательная функция для сортировки по полю order"""
    return item.get('order', 0)

@requests_bp.route('/submit_request', methods=['POST'])
def submit_request():
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

