document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('locationForm');
    const input = document.getElementById('peak_sun_hours');
    const errorMessage = document.getElementById('error-message');
    const geolocationBtn = document.createElement('button');
    
    // Add geolocation button
    geolocationBtn.type = 'button';
    geolocationBtn.className = 'geolocation-btn';
    geolocationBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v4m0 12v4m-7-7H2m20 0h-3m-5 0a7 7 0 1 0-14 0 7 7 0 0 0 14 0z"/>
        </svg>
        Use My Location
    `;
    input.parentNode.insertBefore(geolocationBtn, input.nextSibling);

    // Validation functions
    const showError = (message) => {
        errorMessage.innerHTML = `
            <svg class="error-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            ${message}
        `;
        errorMessage.classList.add('visible');
        input.classList.add('invalid');
    };

    const clearError = () => {
        errorMessage.classList.remove('visible');
        input.classList.remove('invalid');
    };

    // Real-time validation
    input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        if (input.value === '') {
            clearError();
            return;
        }

        if (isNaN(value) || value < 0 || value > 24) {
            showError('Please enter a valid number between 0 and 24');
        } else {
            clearError();
        }
    });

    // Form submission handler
    form.addEventListener('submit', (e) => {
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value < 0 || value > 24) {
            e.preventDefault();
            showError('Invalid input: Please enter a value between 0 and 24');
            input.focus();
        }
    });

    // Geolocation handler
    geolocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser');
            return;
        }

        geolocationBtn.disabled = true;
        geolocationBtn.innerHTML = 'Detecting...';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(`/api/peak-sun-hours?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                    const data = await response.json();
                    input.value = data.peak_sun_hours.toFixed(1);
                    clearError();
                } catch (error) {
                    showError('Failed to fetch location data');
                }
                geolocationBtn.disabled = false;
                geolocationBtn.innerHTML = 'Use My Location';
            },
            (error) => {
                showError('Location access denied');
                geolocationBtn.disabled = false;
                geolocationBtn.innerHTML = 'Use My Location';
            }
        );
    });

    // Accessibility features
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') form.requestSubmit();
    });

    input.setAttribute('aria-describedby', 'error-message');
    errorMessage.setAttribute('role', 'alert');
});