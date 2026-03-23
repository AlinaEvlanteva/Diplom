from flask import Flask
# from flask_login import LoginManager
from config import Config
from models import db
# from models.user import User
# from routes import main_bp, auth_bp, admin_bp
from routes import main_bp, admin_bp

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

app.register_blueprint(main_bp)
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True)