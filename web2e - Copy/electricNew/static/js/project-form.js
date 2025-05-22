document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('images');
    const preview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function() {
        preview.innerHTML = '';
        
        if (this.files) {
            [...this.files].forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imgWrapper = document.createElement('div');
                        imgWrapper.className = 'preview-item';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        
                        imgWrapper.appendChild(img);
                        preview.appendChild(imgWrapper);
                    }
                    
                    reader.readAsDataURL(file);
                }
            });
        }
    });
});
