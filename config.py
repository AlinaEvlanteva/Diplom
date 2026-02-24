import os

class Config:
    SECRET_KEY = 'intechlite-secret-key-2024-very-secure'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/intexlite_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False