from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Импорт моделей (обязательно здесь!)
from .user import User
from .product import Product, Category, Attribute, ProductAttribute
from .request import Request
from .request_item import RequestItem