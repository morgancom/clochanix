function initializeCalculator() {
    const form = document.getElementById('billForm');
    const inputs = {
        previous: document.getElementById('previous_reading'),
        current: document.getElementById('current_reading'),
        cost: document.getElementById('cost_per_unit')
    };

    // Real-time validation and calculation
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', debounce(function(e) {
                validateField(e.target);
                calculateEstimate();
            }, 300));
        }
    });

    // Validation functions
    function validateField(field) {
        const value = parseFloat(field.value);
        let isValid = true;
        let message = '';

        if (isNaN(value) || value < 0) {
            isValid = false;
            message = 'Please enter a positive number';
        } else if (field.id === 'current_reading' && inputs.previous.value) {
            const previousValue = parseFloat(inputs.previous.value);
            if (value <= previousValue) {
                isValid = false;
                message = 'Must be greater than previous reading';
            }
        }

        updateFieldValidation(field, isValid, message);
        return isValid;
    }

    // Live calculation preview
    function calculateEstimate() {
        const values = {
            previous: parseFloat(inputs.previous.value) || 0,
            current: parseFloat(inputs.current.value) || 0,
            cost: parseFloat(inputs.cost.value) || 0
        };

        if (Object.values(values).every(v => !isNaN(v) && v >= 0)) {
            const units = values.current - values.previous;
            const total = units * values.cost;
            
            if (units > 0) {
                updateEstimatePreview(units, total);
            }
        }
    }

    // UI update functions
    function updateFieldValidation(field, isValid, message) {
        field.classList.toggle('is-valid', isValid);
        field.classList.toggle('is-invalid', !isValid);
        
        let tooltip = field.nextElementSibling;
        if (!tooltip || !tooltip.classList.contains('validation-tooltip')) {
            tooltip = createTooltip();
            field.parentNode.insertBefore(tooltip, field.nextSibling);
        }
        
        tooltip.textContent = message;
        tooltip.classList.toggle('valid', isValid);
        tooltip.classList.toggle('invalid', !isValid);
    }

    function updateEstimatePreview(units, total) {
        let preview = document.querySelector('.estimate-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'estimate-preview alert alert-info mt-3';
            form.appendChild(preview);
        }

        preview.innerHTML = `
            <h5>Estimate Preview</h5>
            <p>Units Consumed: ${units.toFixed(2)}</p>
            <p>Estimated Cost: ${formatCurrency(total)}</p>
        `;
    }

    // Helper functions
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'validation-tooltip';
        return tooltip;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF'
        }).format(value);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const isValid = Object.values(inputs).every(input => validateField(input));
            
            if (isValid) {
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Calculating...';
                
                setTimeout(() => form.submit(), 500);
            }
        });
    }
}

// Make function globally available
window.initializeCalculator = initializeCalculator;

// Still keep the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', initializeCalculator);
