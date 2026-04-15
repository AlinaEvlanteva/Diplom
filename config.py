import os
from dotenv import load_dotenv

# Загружаем переменные из .env (только для локальной разработки)
load_dotenv()

class Config:
    # Берем SECRET_KEY из переменных окружения
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-for-local-only')
    
    # База данных
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME = os.environ.get('DB_NAME', 'intexlite_db')
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@localhost/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Настройки для почты
    MAIL_SERVER = 'smtp.yandex.ru'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')