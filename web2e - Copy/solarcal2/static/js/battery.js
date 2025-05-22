document.addEventListener('DOMContentLoaded', function() {
    const voltageSelect = document.getElementById('voltage');
    const form = document.querySelector('form');
    const recommendedSize = parseFloat(document.querySelector('.location-summary').dataset.recommendedSize);

    // Add data attribute to store voltage ranges
    const voltageRanges = {
        '12': { min: 0, max: 1 },
        '24': { min: 1, max: 3 },
        '48': { min: 3, max: Infinity }
    };

    if (voltageSelect) {
        voltageSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            const warningElement = document.getElementById('voltage-warning');

            // Remove existing warning
            if (warningElement) warningElement.remove();

            if (selectedValue) {
                const range = voltageRanges[selectedValue];
                if (recommendedSize < range.min || recommendedSize > range.max) {
                    const warning = document.createElement('div');
                    warning.id = 'voltage-warning';
                    warning.className = 'alert alert-warning mt-3';
                    warning.innerHTML = `⚠️ The selected ${selectedValue}V system is typically recommended for ${range.min}-${range.max !== Infinity ? range.max : 'larger'}kW systems. Your recommended size is ${recommendedSize}kW.`;
                    
                    this.parentNode.insertBefore(warning, this.nextSibling);
                }
            }
        });
    }

    // Form validation
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!voltageSelect.value) {
                e.preventDefault();
                alert('Please select a system voltage before continuing.');
                voltageSelect.focus();
            }
        });
    }
});