import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(subject, body, to_email):
    """Отправка email через SMTP"""
    try:
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = current_app.config['MAIL_USERNAME']
        msg['To'] = to_email
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        print(f"Подключаюсь к {current_app.config['MAIL_SERVER']}:{current_app.config['MAIL_PORT']}")
        print(f"От: {current_app.config['MAIL_USERNAME']}")
        print(f"Кому: {to_email}")
        
        with smtplib.SMTP(current_app.config['MAIL_SERVER'], 
                          current_app.config['MAIL_PORT']) as server:
            server.starttls()  # для Gmail обязательно
            server.login(current_app.config['MAIL_USERNAME'], 
                        current_app.config['MAIL_PASSWORD'])
            server.send_message(msg)
        
        return True, "Письмо отправлено"
    except Exception as e:
        return False, str(e)