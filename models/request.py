from models import db
from datetime import datetime

class Request(db.Model):
    __tablename__ = 'requests'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    comment = db.Column(db.Text)
    total_sum = db.Column(db.Numeric(10, 2), default=0.00)
    status = db.Column(db.String(50), default='new')
    consent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Связь с товарами
    items = db.relationship('RequestItem', backref='request', cascade='all, delete-orphan')
    
    def get_status_display(self):
        statuses = {
            'new': 'Новая',
            'processed': 'В обработке',
            'completed': 'Выполнена',
            'cancelled': 'Отменена'
        }
        return statuses.get(self.status, self.status)