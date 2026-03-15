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
var currentDeleteId = null; // Используем var вместо let

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ =====
function openAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'flex';
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ =====
function openEditCategoryModal(id, name, image) {
    document.getElementById('editCategoryModal').style.display = 'flex';
    document.getElementById('edit_category_id').value = id;
    document.getElementById('edit_category_name').value = name;
    document.getElementById('editCategoryForm').action = '/admin/edit_category/' + id;
    
    let imgElement = document.getElementById('current_category_image');
    if (image && image != 'default_category.png') {
        imgElement.src = '/static/img/small/' + image;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }
}

// ===== ПРЕВЬЮ ИЗОБРАЖЕНИЯ ПРИ ДОБАВЛЕНИИ =====
function previewAddImage(input) {
    var previewContainer = document.getElementById('addImagePreviewContainer');
    var preview = document.getElementById('addImagePreview');
    
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


// ===== МОДАЛЬНОЕ ОКНО ДЛЯ УДАЛЕНИЯ =====
function deleteCategory(id) {
    currentDeleteId = id; // Здесь используется
    document.getElementById('delete_message').innerText = 'Вы действительно хотите удалить эту категорию?';
    document.getElementById('deleteCategoryModal').style.display = 'flex';
}

function confirmDelete() {
    if (currentDeleteId) { // Здесь используется
        window.location.href = '/admin/delete_category/' + currentDeleteId;
    }
}

// ===== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН =====
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ===== ЗАКРЫТИЕ ПО КЛИКУ ВНЕ МОДАЛЬНОГО ОКНА =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ===== ЗАКРЫТИЕ ПО ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

console.log('admin.js загружен успешно');

// ===== АВТОМАТИЧЕСКОЕ СКРЫТИЕ FLASH-СООБЩЕНИЙ =====
document.addEventListener('DOMContentLoaded', function() {
    // Ждём 3 секунды, потом начинаем скрывать
    setTimeout(function() {
        var flashes = document.querySelectorAll('.flash');
        flashes.forEach(function(flash) {
            flash.classList.add('fade-out'); // Запускаем анимацию исчезновения
            setTimeout(function() {
                flash.remove(); // Удаляем из DOM после анимации
            }, 500); // 0.5 секунды на анимацию
        });
    }, 3000); // 3 секунды показа
});