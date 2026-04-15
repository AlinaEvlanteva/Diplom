from flask import render_template, request, jsonify, current_app
from datetime import datetime
from . import feedback_bp
from utils.email import send_email
from .cart import get_cart_count

@feedback_bp.route('/send_feedback', methods=['POST'])
def send_feedback():
    try:
        phone = request.form.get('phone')
        comment = request.form.get('comment', '')
        consent = request.form.get('consent')  # ДОБАВИТЬ ЭТУ СТРОКУ
        
        # ПРОВЕРКА СОГЛАСИЯ
        if not consent:
            return jsonify({'success': False, 'error': 'Необходимо согласие на обработку персональных данных'})
        
        subject = 'Новая заявка с сайта'
        body = f"""
        Поступила новая заявка!
        Телефон: {phone}
        Комментарий: {comment if comment else 'Не указан'}
        Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}
        Согласие на обработку: Да
        """

        # Берем email из конфига
        admin_email = current_app.config.get('ADMIN_EMAIL', '')
        
        success, message = send_email(
            subject=subject,
            body=body,
            to_email=admin_email  
        )
        
        print(f"Отправка: success={success}, message={message}")
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': message})
            
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({'success': False, 'error': str(e)})

@feedback_bp.route('/privacy_policy')
def privacy_policy():
    """Страница политики конфиденциальности"""
    total_cart_items = get_cart_count()
    return render_template('privacy_policy.html', total_cart_items=total_cart_items)