from flask import render_template, session
from models.product import Product, Category, Attribute, ProductAttribute
from . import main_bp
from .cart import get_cart_count

@main_bp.route('/')
def index():
    """Главная страница"""
    categories = Category.query.all()
    total_cart_items = get_cart_count()
    return render_template('main.html', categories=categories, total_cart_items=total_cart_items)

@main_bp.route('/catalog')
def catalog():
    """Страница каталога"""
    categories = Category.query.all()
    total_cart_items = get_cart_count()
    return render_template('katalog.html', categories=categories, total_cart_items=total_cart_items)

@main_bp.route('/category/<int:cat_id>')
def category_products(cat_id):
    """Страница категории с товарами"""
    category = Category.query.get_or_404(cat_id)
    products = Product.query.filter_by(category_id=cat_id).all()
    total_cart_items = get_cart_count()
    return render_template('kat_tovars.html', category=category, products=products, total_cart_items=total_cart_items)

@main_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    """Страница отдельного товара"""
    product = Product.query.get_or_404(product_id)
    attributes = ProductAttribute.query.filter_by(product_id=product_id).all()
    total_cart_items = get_cart_count()
    
    return render_template('tovars_detali.html', 
                         product=product, 
                         attributes=attributes,
                         total_cart_items=total_cart_items)