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

// ===== ПРЕВЬЮ ДЛЯ РЕДАКТИРОВАНИЯ =====
function previewEditImage(input) {
    var currentImg = document.getElementById('current_category_image');
    var previewContainer = document.getElementById('editImagePreviewContainer');
    var preview = document.getElementById('editImagePreview');
    
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

// ===== ТОВАРЫ =====
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

function openEditProductModal(id, name, image, specs, price, unit) {
    alert('Редактирование товара ' + id);
    document.getElementById('editProductModal').style.display = 'flex';
    // Здесь заполнишь поля формы
}

function deleteProduct(id) {
    if (confirm('Вы действительно хотите удалить товар?')) {
        window.location.href = '/admin/delete_product/' + id;
    }
}