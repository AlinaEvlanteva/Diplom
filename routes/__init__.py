from flask import Blueprint

main_bp = Blueprint('main', __name__)
admin_bp = Blueprint('admin', __name__)


cart_bp = Blueprint('cart', __name__)
api_bp = Blueprint('api', __name__)
requests_bp = Blueprint('requests', __name__)
feedback_bp = Blueprint('feedback', __name__)

# Импортируем все маршруты
from . import main, admin, cart, api, requests, feedback