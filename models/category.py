# from . import db

# class Category(db.Model):
    # Добавь эту строку прямо сюда:
    # __table_args__ = {'extend_existing': True} 
    
    # __tablename__ = 'categories'
    # id = db.Column(db.Integer, primary_key=True)
    # name = db.Column(db.String(100), nullable=False)
    # image = db.Column(db.String(255), nullable=False)
    
    # products = db.relationship('Product', backref='category', lazy=True)