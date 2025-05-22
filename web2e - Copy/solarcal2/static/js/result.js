document.addEventListener('DOMContentLoaded', () => {
    // Print functionality
    const printButton = document.querySelector('.btn-print');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }

    // PDF download handler
    const pdfButton = document.querySelector('.btn-pdf');
    if (pdfButton) {
        pdfButton.addEventListener('click', (e) => {
            e.preventDefault();
            showLoadingState(e.target);
            setTimeout(() => {
                window.location.href = e.target.href;
                restoreButtonState(e.target);
            }, 1000);
        });
    }

    // Table row interactions
    document.querySelectorAll('.results-table tr').forEach(row => {
        row.addEventListener('click', () => {
            row.classList.toggle('selected-row');
        });
    });

    // Smooth scroll for print
    const smoothScroll = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Before print event
    window.addEventListener('beforeprint', () => {
        document.querySelectorAll('.results-card').forEach(card => {
            card.style.boxShadow = 'none';
        });
        smoothScroll();
    });

    // Loading state functions
    function showLoadingState(button) {
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Generating PDF...
        `;
        button.disabled = true;
    }

    function restoreButtonState(button) {
        button.innerHTML = 'Download PDF';
        button.disabled = false;
    }

    // Restart confirmation
    document.querySelector('.restart-btn').addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to restart? All data will be lost.')) {
            e.preventDefault();
        }
    });
});