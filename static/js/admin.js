// ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =====
function showTab(tabId, element) {
    document.querySelectorAll('.tab_content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav_admin button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// ===== ПЕРЕМЕННЫЕ ДЛЯ УДАЛЕНИЯ =====
var currentDeleteId = null;
var currentDeleteProductId = null;
var currentDeleteAttributeId = null;

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ КАТЕГОРИИ =====
function openAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'flex';
}

// ===== УНИВЕРСАЛЬНОЕ ПРЕВЬЮ ДЛЯ ЛЮБЫХ МОДАЛЬНЫХ ОКОН =====
function previewImage(input, previewContainerId, previewImageId) {
    var previewContainer = document.getElementById(previewContainerId);
    var preview = document.getElementById(previewImageId);
    
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '#';
        previewContainer.style.display = 'none';
    }
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ КАТЕГОРИИ =====
function openEditCategoryModal(id, name, image) {
    document.getElementById('editCategoryModal').style.display = 'flex';
    document.getElementById('edit_category_id').value = id;
    document.getElementById('edit_category_name').value = name;
    document.getElementById('editCategoryForm').action = '/admin/edit_category/' + id;
    
    // Показываем текущее изображение
    let currentImg = document.getElementById('current_category_image');
    let previewContainer = document.getElementById('editImagePreviewContainer');
    let preview = document.getElementById('editImagePreview');
    
    if (image && image != 'default_category.png') {
        currentImg.src = '/static/img/small/' + image;
        currentImg.style.display = 'block';
    } else {
        currentImg.style.display = 'none';
    }
    
    // Скрываем превью нового
    previewContainer.style.display = 'none';
    preview.src = '#';
    
    // Очищаем поле file
    let fileInput = document.getElementById('editCategoryImage');
    if (fileInput) fileInput.value = '';
}

// ===== ПРЕВЬЮ ДЛЯ РЕДАКТИРОВАНИЯ (универсальная) =====
function previewEditImage(input, currentImgId, previewContainerId, previewImgId) {
    var currentImg = document.getElementById(currentImgId);
    var previewContainer = document.getElementById(previewContainerId);
    var preview = document.getElementById(previewImgId);
    
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
            currentImg.style.display = 'none';
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
        preview.src = '#';
        currentImg.style.display = 'block';
    }
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ УДАЛЕНИЯ КАТЕГОРИИ (ОБНОВЛЕНО) =====
function deleteCategory(id) {
    // Сначала проверяем, есть ли у категории характеристики
    fetch('/admin/check_category_attributes/' + id)
    .then(response => response.json())
    .then(data => {
        if (data.has_attributes || data.has_products) {
            // Формируем сообщение
            let message = '';
            if (data.has_products && data.has_attributes) {
                message = `В этой категории есть ${data.products_count} товар(ов) и ${data.attributes_count} характеристик(и).\n\nПри удалении категории они тоже удалятся.\n\nПродолжить?`;
            } else if (data.has_products) {
                message = `В этой категории есть ${data.products_count} товар(ов).\n\nПри удалении категории они тоже удалятся.\n\nПродолжить?`;
            } else if (data.has_attributes) {
                message = `В этой категории есть ${data.attributes_count} характеристик(и).\n\nПри удалении категории они тоже удалятся.\n\nПродолжить?`;
            }
            
            currentDeleteId = id;
            document.getElementById('delete_message').innerText = message;
            document.getElementById('deleteCategoryModal').style.display = 'flex';
        } else {
            // Если нет товаров и характеристик - обычное удаление
            currentDeleteId = id;
            document.getElementById('delete_message').innerText = 'Вы действительно хотите удалить эту категорию?';
            document.getElementById('deleteCategoryModal').style.display = 'flex';
        }
    })
}

function confirmDelete() {
    if (currentDeleteId) {
        window.location.href = '/admin/delete_category/' + currentDeleteId;
    }
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ ТОВАРА =====
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
    
    // Сбрасываем превью при открытии
    let previewContainer = document.getElementById('addProductImagePreviewContainer');
    let preview = document.getElementById('addProductImagePreview');
    let fileInput = document.getElementById('addProductImage');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (preview) preview.src = '#';
    if (fileInput) fileInput.value = '';
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ ТОВАРА =====
function openEditProductModal(id, name, image, specs, price, unit, article, categoryId, fullDesc, oldPrice) {
    document.getElementById('editProductModal').style.display = 'flex';
    
    // Устанавливаем action для формы
    document.getElementById('editProductForm').action = '/admin/edit_product/' + id;
    
    // Заполняем поля
    document.getElementById('edit_product_id').value = id;
    document.getElementById('edit_product_name').value = name || '';
    document.getElementById('edit_product_article').value = article || '';
    document.getElementById('edit_product_price').value = price || '';
    document.getElementById('edit_product_unit').value = unit || 'шт';
    document.getElementById('edit_product_short_specs').value = specs || '';
    document.getElementById('edit_product_full_description').value = fullDesc || '';
    
    // Отображение старой цены
    let oldPriceDisplay = document.getElementById('edit_product_old_price_display');
    if (oldPriceDisplay) {
        if (oldPrice && oldPrice != 'None' && oldPrice != '') {
            oldPriceDisplay.textContent = oldPrice + ' ₽';
            oldPriceDisplay.style.display = 'inline';
        } else {
            oldPriceDisplay.textContent = '';
            oldPriceDisplay.style.display = 'none';
        }
    }
    
    // Скрытое поле для отправки
    document.getElementById('edit_product_old_price').value = oldPrice || '';
    
    // Устанавливаем категорию
    if (categoryId) {
        document.getElementById('edit_product_category').value = categoryId;
    }
    
    // Показываем текущее изображение
    let currentImg = document.getElementById('edit_product_current_image');
    if (image && image != 'default.png' && image != 'default_category.png') {
        currentImg.src = '/static/img/small/' + image;
        currentImg.style.display = 'block';
    } else {
        currentImg.src = '';
        currentImg.style.display = 'none';
    }
    
    // Сбрасываем превью
    let previewContainer = document.getElementById('editProductImagePreviewContainer');
    let preview = document.getElementById('editProductImagePreview');
    let fileInput = document.getElementById('editProductImage');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (preview) preview.src = '#';
    if (fileInput) fileInput.value = '';
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ УДАЛЕНИЯ ТОВАРА =====
function deleteProduct(id) {
    currentDeleteProductId = id;
    document.getElementById('delete_message').innerText = 'Вы действительно хотите удалить этот товар?';
    document.getElementById('deleteProductModal').style.display = 'flex';
}

function confirmDeleteProduct() {
    if (currentDeleteProductId) {
        window.location.href = '/admin/delete_product/' + currentDeleteProductId;
    }
}

// ===== УПРАВЛЕНИЕ ХАРАКТЕРИСТИКАМИ (ТИПЫ) =====
function openAddAttributeModal() {
    document.getElementById('addAttributeModal').style.display = 'flex';
}

function openEditAttributeModal(id, name, unit, categoryId) {
    document.getElementById('editAttributeModal').style.display = 'flex';
    
    // Устанавливаем action для формы
    document.getElementById('editAttributeForm').action = '/admin/edit_attribute/' + id;
    
    // Заполняем поля
    document.getElementById('edit_attribute_name').value = name || '';
    document.getElementById('edit_attribute_unit').value = unit || '';
    
    // Устанавливаем категорию
    if (categoryId) {
        document.getElementById('edit_attribute_category').value = categoryId;
    }
}

function deleteAttribute(id) {
    currentDeleteAttributeId = id;
    document.getElementById('deleteAttributeModal').style.display = 'flex';
}

function confirmDeleteAttribute() {
    if (currentDeleteAttributeId) {
        window.location.href = '/admin/delete_attribute/' + currentDeleteAttributeId;
    }
}

// ===== ФИЛЬТР ДЛЯ ХАРАКТЕРИСТИК =====
function filterAttributes() {
    var filter = document.getElementById('category_filter').value;
    var cards = document.querySelectorAll('#attributes_card_container .attribute_card');
    
    cards.forEach(card => {
        var categoryId = card.getAttribute('data-category-id');
        
        if (filter === 'all') {
            card.style.display = 'flex';  // или 'block', смотря какой display у карточки
        } else if (categoryId == filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== НОВЫЕ ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ ЗНАЧЕНИЯМИ ХАРАКТЕРИСТИК ТОВАРОВ =====

/**
 * Открывает модальное окно для редактирования характеристик конкретного товара
 */
function openProductAttributesModal(productId) {
    document.getElementById('productAttributesModal').style.display = 'flex';
    document.getElementById('attributesLoading').style.display = 'block';
    document.getElementById('attributesContent').style.display = 'none';
    
    fetch('/admin/get_product_attributes/' + productId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('attributesModalTitle').textContent = 
                'Характеристики: ' + data.product_name;

            document.getElementById('attributesForm').dataset.categoryId = data.category_id;
            document.getElementById('attributesForm').dataset.productId = productId;
            
            // ===== ПРОВЕРКА ДЛЯ КАТЕГОРИЙ =====
            const modal = document.getElementById('productAttributesModal');
            
            // Удаляем все старые классы
            modal.classList.remove('pulley_bushing_modal', 'seals_modal');
            
            // Добавляем класс в зависимости от категории
            if (data.category_id === 4) {  // Шкивы, втулки
                modal.classList.add('pulley_bushing_modal');
            } else if (data.category_id === 5) {  // Кольца, манжеты, сальники
                modal.classList.add('seals_modal');
            }
            // ===== КОНЕЦ ПРОВЕРКИ =====
            
            const attributesList = document.getElementById('attributesList');
            attributesList.innerHTML = '';
            
            if (data.attributes.length === 0) {
                attributesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #42546E;">Для этой категории пока нет характеристик. Сначала создайте характеристики в разделе "Типы характеристик".</p>';
                
                const modalActions = document.querySelector('#productAttributesModal .modal_actions');
                modalActions.innerHTML = `
                    <button type="button" class="but_save" onclick="goToAttributesTab()">Перейти</button>
                    <button type="button" class="but_cancel" onclick="closeModal('productAttributesModal')">Отмена</button>
                `;
            } else {
                // Создаем поля
                data.attributes.forEach(attr => {
                    const label = document.createElement('label');
                    label.className = 'form_label';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = attr.name + (attr.unit ? ' (' + attr.unit + ')' : '');
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.name = 'attr_' + attr.id;
                    input.value = attr.value || '';
                    input.placeholder = 'Введите значение';
                    input.className = 'form_input';
                    
                    label.appendChild(nameSpan);
                    label.appendChild(input);
                    attributesList.appendChild(label);
                });
                
                const modalActions = document.querySelector('#productAttributesModal .modal_actions');
                modalActions.innerHTML = `
                    <button type="button" class="but_save" onclick="saveProductAttributes()">Сохранить</button>
                    <button type="button" class="but_cancel" onclick="closeModal('productAttributesModal')">Отмена</button>
                `;
            }
            
            document.getElementById('attributesForm').dataset.productId = productId;
            document.getElementById('attributesLoading').style.display = 'none';
            document.getElementById('attributesContent').style.display = 'block';
        })
        .catch(error => {
            showFlashMessage('Ошибка при загрузке характеристик', 'error');
            closeModal('productAttributesModal');
        });
}

/**
 * Переход на вкладку "Типы характеристик"
 */
function goToAttributesTab() {
    // Закрываем текущее модальное окно
    closeModal('productAttributesModal');
    
    // Находим кнопку вкладки "Типы характеристик" и переключаемся на нее
    const attributesTabButton = document.querySelector('.nav_admin button.but_charakter');
    if (attributesTabButton) {
        showTab('attributes', attributesTabButton);
    }
    
    // Показываем flash-сообщение
    showFlashMessage('Перейдите в раздел "Типы характеристик", чтобы создать характеристики для этой категории', 'info');
}
/**
 * Сохраняет значения характеристик товара
 */
function saveProductAttributes() {
    const form = document.getElementById('attributesForm');
    const productId = form.dataset.productId;
    const inputs = form.querySelectorAll('.form_input');
    
    // Собираем данные
    const attributes = {};
    inputs.forEach(input => {
        const attrId = input.name.replace('attr_', '');
        attributes[attrId] = input.value;
    });
    
    // Отправляем на сервер
    fetch('/admin/save_product_attributes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            attributes: attributes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFlashMessage('Характеристики успешно сохранены', 'success');
            closeModal('productAttributesModal');
        } else {
            showFlashMessage('Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('Ошибка при сохранении', 'error');
    });
}

/**
 * Показывает flash-сообщение
 */
function showFlashMessage(message, category) {
    const flashContainer = document.querySelector('.flash_messages');
    if (!flashContainer) return;
    
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash flash-' + category;
    flashDiv.textContent = message;
    
    flashContainer.appendChild(flashDiv);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        flashDiv.style.transition = 'opacity 0.5s';
        flashDiv.style.opacity = '0';
        setTimeout(() => flashDiv.remove(), 500);
    }, 3000);
}

// ===== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Сброс для модального окна категорий
    if (modalId === 'editCategoryModal') {
        let currentImg = document.getElementById('current_category_image');
        let previewContainer = document.getElementById('editImagePreviewContainer');
        let preview = document.getElementById('editImagePreview');
        let fileInput = document.getElementById('editCategoryImage');
        
        if (previewContainer) previewContainer.style.display = 'none';
        if (preview) preview.src = '#';
        if (currentImg) currentImg.style.display = 'block';
        if (fileInput) fileInput.value = '';
    }
    
    // Сброс для модального окна добавления категории
    if (modalId === 'addCategoryModal') {
        let previewContainer = document.getElementById('addImagePreviewContainer');
        let preview = document.getElementById('addImagePreview');
        let fileInput = document.getElementById('addCategoryImage');
        
        if (previewContainer) previewContainer.style.display = 'none';
        if (preview) preview.src = '#';
        if (fileInput) fileInput.value = '';
    }
    
    // Сброс для модального окна добавления характеристики (типа)
    if (modalId === 'addAttributeModal') {
        let form = document.querySelector('#addAttributeModal form');
        if (form) form.reset();
    }
    
    // Сброс для модального окна редактирования характеристики (типа)
    if (modalId === 'editAttributeModal') {
        let form = document.getElementById('editAttributeForm');
        if (form) form.reset();
    }
    
    // Сброс для модального окна удаления характеристики (типа)
    if (modalId === 'deleteAttributeModal') {
        currentDeleteAttributeId = null;
    }
    
    // Сброс для модального окна характеристик товара
    if (modalId === 'productAttributesModal') {
        const attributesList = document.getElementById('attributesList');
        if (attributesList) attributesList.innerHTML = '';
        
        const loading = document.getElementById('attributesLoading');
        const content = document.getElementById('attributesContent');
        if (loading) loading.style.display = 'block';
        if (content) content.style.display = 'none';
    }
}

// ===== ЗАКРЫТИЕ ПО КЛИКУ ВНЕ МОДАЛЬНОГО ОКНА =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        var modalId = event.target.id;
        closeModal(modalId);
    }
}

// ===== ЗАКРЫТИЕ ПО ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'flex') {
                closeModal(modal.id);
            }
        });
    }
});

// ===== АВТОМАТИЧЕСКОЕ СКРЫТИЕ FLASH-СООБЩЕНИЙ =====
setTimeout(function() {
    document.querySelectorAll('.flash').forEach(function(msg) {
        msg.style.transition = 'opacity 0.5s';
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
    });
}, 3000);

// ===== ЗАЯВКИ =====

// Просмотр товаров заявки
function viewRequestItems(requestId) {
    fetch('/admin/get_request_items/' + requestId)
        .then(response => response.json())
        .then(data => {
            let html = '';
            
            data.items.forEach(item => {
                html += `
                    <div class="request_item">
                        <div class="request_item_image">
                            <img src="/static/img/small/${item.image}" alt="${item.name}">
                        </div>
                        <div class="request_item_info">
                            <div class="request_item_name">${item.name}</div>
                            <div class="request_item_article">Артикул: ${item.article}</div>
                            <div class="request_item_price">${item.price} ₽ / ${item.unit || 'шт'}</div>
                        </div>
                        <div class="request_item_quantity">x ${item.quantity}</div>
                        <div class="request_item_total">${(item.price * item.quantity).toFixed(2)} ₽</div>
                    </div>
                `;
            });
            
            html += `<div class="request_total"> Итого: ${data.total_sum.toFixed(2)} ₽</div>`;
            if (data.comment) {
                html += `<div class="request_comment"> Комментарий: ${data.comment}</div>`;
            }
            
            document.getElementById('requestItemsList').innerHTML = html;
            document.getElementById('requestItemsModal').style.display = 'flex';
        })
        .catch(error => console.error('Ошибка:', error));
}

// Обновление статуса заявки
function updateRequestStatus(requestId, status) {
    fetch('/admin/update_request_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId, status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFlashMessage('Статус обновлен', 'success');
        } else {
            showFlashMessage('Ошибка: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showFlashMessage('Ошибка при обновлении статуса', 'error');
    });
}

// Удаление заявки
function deleteRequest(requestId) {
    if (confirm('Вы действительно хотите удалить эту заявку?')) {
        window.location.href = '/admin/delete_request/' + requestId;
    }
}



function openEditProductModalFromData(btn) {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const image = btn.dataset.image;
    const specs = btn.dataset.specs;
    const price = btn.dataset.price;
    const unit = btn.dataset.unit;
    const article = btn.dataset.article;
    const categoryId = btn.dataset.category;
    const fullDesc = btn.dataset.desc;
    const oldPrice = btn.dataset.oldprice;
    
    openEditProductModal(id, name, image, specs, price, unit, article, categoryId, fullDesc, oldPrice);
}

console.log('admin.js загружен успешно');