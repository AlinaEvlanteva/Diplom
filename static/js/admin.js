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

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ =====
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

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ =====
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
// ===== МОДАЛЬНОЕ ОКНО ДЛЯ УДАЛЕНИЯ =====
function deleteCategory(id) {
    currentDeleteId = id;
    document.getElementById('delete_message').innerText = 'Вы действительно хотите удалить эту категорию?';
    document.getElementById('deleteCategoryModal').style.display = 'flex';
}

function confirmDelete() {
    if (currentDeleteId) {
        window.location.href = '/admin/delete_category/' + currentDeleteId;
    }
}

// ===== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН =====
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Если закрываем окно редактирования — сбрасываем всё
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
    
    // Если закрываем окно добавления — сбрасываем превью
    if (modalId === 'addCategoryModal') {
        let previewContainer = document.getElementById('addImagePreviewContainer');
        let preview = document.getElementById('addImagePreview');
        let fileInput = document.getElementById('addCategoryImage');
        
        if (previewContainer) previewContainer.style.display = 'none';
        if (preview) preview.src = '#';
        if (fileInput) fileInput.value = '';
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

console.log('admin.js загружен успешно');


// ===== РЕДАКТИРОВАНИЕ ТОВАРА =====
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
    
    // Отображение старой цены в span
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

// ===== ТОВАРЫ =====
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


// ===== ПЕРЕМЕННЫЕ ДЛЯ УДАЛЕНИЯ ТОВАРА =====
var currentDeleteProductId = null;

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

// ===== ФИЛЬТР ДЛЯ ХАРАКТЕРИСТИК =====
function filterAttributes() {
    var filter = document.getElementById('category_filter').value;
    var rows = document.querySelectorAll('#attributes tbody tr');
    
    rows.forEach(row => {
        var categoryId = row.getAttribute('data-category-id'); // берем из data-атрибута
        
        if (filter === 'all') {
            row.style.display = '';
        } else if (categoryId === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}