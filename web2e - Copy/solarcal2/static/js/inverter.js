document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inverterForm');
    const efficiencyInput = document.getElementById('efficiency');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    efficiencyInput.parentNode.appendChild(errorDiv);

    // Real-time validation
    efficiencyInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (this.value === '') {
            this.classList.remove('is-invalid');
            errorDiv.style.display = 'none';
            return;
        }

        if (isNaN(value) || value < 90 || value > 98) {
            this.classList.add('is-invalid');
            errorDiv.textContent = 'Please enter a value between 90 and 98';
            errorDiv.style.display = 'block';
        } else {
            this.classList.remove('is-invalid');
            errorDiv.style.display = 'none';
        }
    });

    // Form submission handling
    form.addEventListener('submit', function(e) {
        const value = parseFloat(efficiencyInput.value);
        
        if (isNaN(value) || value < 90 || value > 98) {
            e.preventDefault();
            efficiencyInput.classList.add('is-invalid');
            errorDiv.textContent = 'Please enter a valid efficiency percentage between 90 and 98';
            errorDiv.style.display = 'block';
            efficiencyInput.focus();
        }
    });

    // Initial validation check
    efficiencyInput.addEventListener('blur', function() {
        if (this.value !== '' && (this.value < 90 || this.value > 98)) {
            this.classList.add('is-invalid');
            errorDiv.textContent = 'Value must be between 90 and 98';
            errorDiv.style.display = 'block';
        }
    });
});