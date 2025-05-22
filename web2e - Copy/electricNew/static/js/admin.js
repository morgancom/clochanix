class AdminPanel {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.setupProjectActions();
        this.setupFormValidation();
        this.setupMediaPreview();
    }

    setupProjectActions() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e));
        });
    }

    async handleDelete(e) {
        const card = e.target.closest('.project-card');
        const projectId = card.dataset.projectId;
        const projectKey = card.dataset.projectType;

        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/admin/project/delete/${projectKey}/${projectId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                card.remove();
                this.showNotification('Project deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Error deleting project', 'error');
        }
    }

    setupFormValidation() {
        const form = document.querySelector('.project-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.validateForm(e));
    }

    validateForm(e) {
        // Add form validation logic
    }

    setupMediaPreview() {
        const imageInput = document.querySelector('input[type="file"][accept="image/*"]');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImagePreview(e));
        }
    }

    handleImagePreview(e) {
        // Add image preview logic
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});

// Add this to handle location form functionality

function initLocationForm() {
    // Auto-populate city and country if empty
    const cityInput = document.getElementById('project_city');
    const countryInput = document.getElementById('project_country');
    
    if (!cityInput.value) cityInput.value = 'Limbe';
    if (!countryInput.value) countryInput.value = 'Cameroon';

    // Year validation
    const yearInput = document.getElementById('completion_year');
    const currentYear = new Date().getFullYear();
    
    yearInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < currentYear) {
            this.value = currentYear;
            alert('Project year cannot be in the past');
        }
        if (value > currentYear + 6) {
            this.value = currentYear + 6;
            alert('Project year cannot be more than 6 years in the future');
        }
    });

    // Location preview
    const specificLocationInput = document.getElementById('specific_location');
    const previewDiv = document.createElement('div');
    previewDiv.className = 'location-preview';
    specificLocationInput.parentNode.appendChild(previewDiv);

    specificLocationInput.addEventListener('input', function() {
        previewDiv.textContent = `Project will be located in ${this.value}, ${cityInput.value}, ${countryInput.value}`;
    });
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.project-location-form')) {
        initLocationForm();
    }
});

// Add validation before form submission
document.querySelector('form')?.addEventListener('submit', function(e) {
    const specificLocation = document.getElementById('specific_location').value;
    if (!specificLocation.trim()) {
        e.preventDefault();
        alert('Please enter a specific location');
        return false;
    }
});
