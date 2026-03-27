from flask import render_template, request, jsonify
from datetime import datetime
from . import feedback_bp
from utils.email import send_email

@feedback_bp.route('/send_feedback', methods=['POST'])
def send_feedback():
    try:
        phone = request.form.get('phone')
        comment = request.form.get('comment', '')
        
        subject = 'Новая заявка с сайта'
        body = f"""
        Поступила новая заявка!
        📞 Телефон: {phone}
        📝 Комментарий: {comment if comment else 'Не указан'}
        📅 Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}
        """
        
        success, message = send_email(
            subject=subject,
            body=body,
            to_email='evlantevaalina17@gmail.com'
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
    return render_template('privacy_policy.html')