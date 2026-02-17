from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Настройка подключения к MySQL
# Формат: 'mysql+pymysql://ЛОГИН:ПАРОЛЬ@localhost/ИМЯ_БАЗЫ'
# Обычно в XAMPP логин 'root', а пароля нет (пусто)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/intechlite_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Описываем таблицы (Модели), чтобы Flask мог с ними работать
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String(255))

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    short_specs = db.Column(db.String(255))
    full_description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image = db.Column(db.String(255))

# ГЛАВНАЯ СТРАНИЦА
@app.route('/')
def index():
    # Получаем категории для отображения на главной (если они там нужны)
    all_categories = Category.query.all()
    return render_template('glavnaya.html', categories=all_categories)

# СТРАНИЦА КАТАЛОГА
# @app.route('/catalog')
# def catalog():
#     all_categories = Category.query.all()
#     return render_template('katalog.html', categories=all_categories)

@app.route('/katalog')
def katalog():
    # Получаем все категории из БД
    all_categories = Category.query.all()
    return render_template('katalog.html', categories=all_categories)

@app.route('/category/<int:cat_id>')
def category_products(cat_id):
    # Получаем категорию по id
    category = Category.query.get_or_404(cat_id)
    # Получаем товары этой категории
    products = Product.query.filter_by(category_id=cat_id).all()
    return render_template('kat_podshipniki.html', category=category, products=products)

if __name__ == '__main__':
    app.run(debug=True)

