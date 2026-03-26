import os

class Config:
    SECRET_KEY = 'intechlite-secret-key-2024-very-secure'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/intexlite_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Настройки для Gmail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_SSL = False
    MAIL_USE_TLS = True
    MAIL_USERNAME = ''  # твоя почта
    MAIL_PASSWORD = ''       # пароль приложения
    ADMIN_EMAIL = ''     # куда приходят заявки