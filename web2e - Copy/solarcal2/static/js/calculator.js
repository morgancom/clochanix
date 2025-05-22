document.addEventListener('DOMContentLoaded', function() {
    // Equipment form handling
    const equipmentForm = document.getElementById('equipmentForm');
    let equipmentCount = 1;

    // Add equipment row
    function addEquipmentRow() {
        const tbody = document.querySelector('#equipmentTable tbody');
        const newRow = document.createElement('tr');
        newRow.className = 'equipment-row';
        newRow.innerHTML = `
            <td><input type="text" class="form-control" name="name_${equipmentCount}" required></td>
            <td><input type="number" class="form-control" name="power_${equipmentCount}" step="0.01" required></td>
            <td><input type="number" class="form-control" name="runtime_${equipmentCount}" step="0.01" required></td>
            <td><input type="number" class="form-control" name="quantity_${equipmentCount}" value="1" min="1"></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-btn">Remove</button></td>
        `;
        tbody.appendChild(newRow);
        equipmentCount++;
    }

    // Remove equipment row
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const rows = document.querySelectorAll('.equipment-row');
            if (rows.length > 1) {
                e.target.closest('tr').remove();
            } else {
                alert('You must have at least one equipment item.');
            }
        }
    });

    // Form validation
    if (equipmentForm) {
        equipmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = new FormData(this);
            const equipment = [];

            // Collect equipment data
            for (let i = 0; i < equipmentCount; i++) {
                const name = data.get(`name_${i}`);
                if (name) {
                    equipment.push({
                        name: name,
                        power: parseFloat(data.get(`power_${i}`)),
                        runtime: parseFloat(data.get(`runtime_${i}`)),
                        quantity: parseInt(data.get(`quantity_${i}`))
                    });
                }
            }

            // Submit data
            fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ equipment })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/results';
                } else {
                    alert('Error calculating results. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    }

    // Add button click handler
    const addButton = document.getElementById('addEquipment');
    if (addButton) {
        addButton.addEventListener('click', addEquipmentRow);
    }
});
