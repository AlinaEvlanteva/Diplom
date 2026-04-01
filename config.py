import os

class Config:
    SECRET_KEY = 'intechlite-secret-key-2024-very-secure'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/intexlite_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Настройки для Gmail
    MAIL_SERVER = 'smtp.yandex.ru'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = 'alinavestovskaya@yandex.ru'  # твоя почта
    MAIL_PASSWORD = 'pkvoisojdjxdodki'       # пароль приложения
    ADMIN_EMAIL = 'alinavestovskaya@yandex.ru'     # куда приходят заявки