from flask import render_template
from models import db
from models.product import Category, Product, ProductAttribute
from . import main_bp

@main_bp.route('/')
def index():
    """Главная страница"""
    categories = Category.query.all()
    return render_template('main.html', categories=categories)

@main_bp.route('/catalog')
def catalog():
    """Страница каталога"""
    categories = Category.query.all()
    return render_template('katalog.html', categories=categories)

@main_bp.route('/category/<int:cat_id>')
def category_products(cat_id):
    """Страница категории с товарами"""
    category = Category.query.get_or_404(cat_id)
    products = Product.query.filter_by(category_id=cat_id).all()
    return render_template('kat_tovars.html', category=category, products=products)

@main_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    """Страница отдельного товара"""
    product = Product.query.get_or_404(product_id)
    attributes = ProductAttribute.query.filter_by(product_id=product_id).all()
    return render_template('tovars_detali.html', product=product, attributes=attributes)