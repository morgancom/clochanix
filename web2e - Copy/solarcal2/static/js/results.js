document.addEventListener('DOMContentLoaded', function() {
    // Print functionality
    const printButton = document.querySelector('.print-results');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

    // Download PDF functionality
    const downloadButton = document.querySelector('.download-pdf');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            fetch('/download-pdf')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'solar-calculation-results.pdf';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error downloading PDF. Please try again.');
                });
        });
    }

    // Animate numbers
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * progress);
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Animate all result numbers
    document.querySelectorAll('.result-value').forEach(element => {
        const value = parseInt(element.textContent);
        element.textContent = '0';
        animateValue(element, 0, value, 1000);
    });
});
