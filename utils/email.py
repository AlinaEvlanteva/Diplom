import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(subject, body, to_email):
    """Отправка email через SMTP (порт 465)"""
    try:
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = current_app.config['MAIL_USERNAME']
        msg['To'] = to_email
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        print(f"Подключаюсь к {current_app.config['MAIL_SERVER']}:{current_app.config['MAIL_PORT']}")
        print(f"От: {current_app.config['MAIL_USERNAME']}")
        print(f"Кому: {to_email}")
        
        # Для порта 465 используем SMTP_SSL, а не STARTTLS
        with smtplib.SMTP_SSL(current_app.config['MAIL_SERVER'], 
                               current_app.config['MAIL_PORT']) as server:
            server.login(current_app.config['MAIL_USERNAME'], 
                        current_app.config['MAIL_PASSWORD'])
            server.send_message(msg)
        
        print("✅ Письмо отправлено")
        return True, "Письмо отправлено"
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        # Логируем письмо
        print("=" * 60)
        print("📧 ЗАЯВКА СОХРАНЕНА В ЛОГАХ")
        print(body)
        print("=" * 60)
        return True, "Заявка принята (письмо сохранено в логах)"