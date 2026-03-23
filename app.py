from flask import Flask
from config import Config
from models import db  # импортируем db из models
from routes import main_bp, admin_bp

# Модели НЕ импортируем здесь, они уже импортированы в models/__init__.py
# SQLAlchemy их увидит через db

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = 'your-secret-key'

db.init_app(app)

app.register_blueprint(main_bp)
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True)