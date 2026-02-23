# from flask import Flask, render_template
# from flask_sqlalchemy import SQLAlchemy

# app = Flask(__name__)

# # Настройка подключения к MySQL
# # Формат: 'mysql+pymysql://ЛОГИН:ПАРОЛЬ@localhost/ИМЯ_БАЗЫ'
# # Обычно в XAMPP логин 'root', а пароля нет (пусто)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/intechlite_db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)

# # Описываем таблицы (Модели), чтобы Flask мог с ними работать
# class Category(db.Model):
#     __tablename__ = 'categories'
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(255), nullable=False)
#     image = db.Column(db.String(255))

# class Product(db.Model):
#     __tablename__ = 'products'
#     id = db.Column(db.Integer, primary_key=True)
#     category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
#     name = db.Column(db.String(255), nullable=False)
#     short_specs = db.Column(db.String(255))
#     full_description = db.Column(db.Text)
#     price = db.Column(db.Numeric(10, 2), nullable=False)
#     image = db.Column(db.String(255))

# # ГЛАВНАЯ СТРАНИЦА
# @app.route('/')
# def index():
#     # Получаем категории для отображения на главной (если они там нужны)
#     all_categories = Category.query.all()
#     return render_template('glavnaya.html', categories=all_categories)

# # СТРАНИЦА КАТАЛОГА
# # @app.route('/catalog')
# # def catalog():
# #     all_categories = Category.query.all()
# #     return render_template('katalog.html', categories=all_categories)

# @app.route('/katalog')
# def katalog():
#     # Получаем все категории из БД
#     all_categories = Category.query.all()
#     return render_template('katalog.html', categories=all_categories)

# @app.route('/category/<int:cat_id>')
# def category_products(cat_id):
#     # Получаем категорию по id
#     category = Category.query.get_or_404(cat_id)
#     # Получаем товары этой категории
#     products = Product.query.filter_by(category_id=cat_id).all()
#     return render_template('kat_podshipniki.html', category=category, products=products)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/intexlite_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Таблица пользователей
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')

# Таблица категорий
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    image = db.Column(db.String(150))
    # Связь с товарами
    products = db.relationship('Product', backref='category', lazy=True)

# Таблица товаров
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    article = db.Column(db.String(50), unique=True, nullable=False)
    short_specs = db.Column(db.String(100))
    full_description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), default='шт')
    image = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Связь с характеристиками
    attributes = db.relationship('ProductAttribute', backref='product', lazy=True)

# Таблица атрибутов (характеристики)
class Attribute(db.Model):
    __tablename__ = 'attributes'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    unit = db.Column(db.String(20))
    # Связь с значениями
    values = db.relationship('ProductAttribute', backref='attribute', lazy=True)

# Таблица значений атрибутов для товаров
class ProductAttribute(db.Model):
    __tablename__ = 'product_attributes'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    attribute_id = db.Column(db.Integer, db.ForeignKey('attributes.id'), nullable=False)
    value = db.Column(db.String(255), nullable=False)

# Таблица избранного
class Favorite(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)

# Таблица корзины
class Cart(db.Model):
    __tablename__ = 'cart'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

# ----- МАРШРУТЫ (ROUTES) -----

@app.route('/')
def index():
    """Главная страница"""
    all_categories = Category.query.all()
    return render_template('main.html', categories=all_categories)

@app.route('/catalog')
def catalog():
    """Страница каталога"""
    all_categories = Category.query.all()
    return render_template('katalog.html', categories=all_categories)

@app.route('/category/<int:cat_id>')
def category_products(cat_id):
    """Страница категории с товарами"""
    category = Category.query.get_or_404(cat_id)
    products = Product.query.filter_by(category_id=cat_id).all()
    return render_template('kat_tovars.html', category=category, products=products)
# kat_podshipniki

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    """Страница отдельного товара"""
    product = Product.query.get_or_404(product_id)
    attributes = ProductAttribute.query.filter_by(product_id=product_id).all()
    return render_template('tovars_detali.html', product=product, attributes=attributes)

# Запуск приложения
if __name__ == '__main__':
    app.run(debug=True)