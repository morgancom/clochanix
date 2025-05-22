document.addEventListener('DOMContentLoaded', function() {
    let equipmentIndex = 1;
    const maxRows = 10;

    // Add new equipment row
    document.getElementById('addEquipment').addEventListener('click', function() {
        if (equipmentIndex >= maxRows) {
            alert(`Maximum ${maxRows} equipment items allowed`);
            return;
        }

        const newRow = document.createElement('tr');
        newRow.className = 'equipment-row';
        newRow.innerHTML = `
            <td><input type="text" class="form-control" name="name_${equipmentIndex}" required></td>
            <td><input type="number" class="form-control" name="power_${equipmentIndex}" step="0.01" min="0" required></td>
            <td><input type="number" class="form-control" name="runtime_${equipmentIndex}" step="0.01" min="0" required></td>
            <td><input type="number" class="form-control" name="quantity_${equipmentIndex}" value="1" min="1"></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-btn">Remove</button></td>
        `;
        
        document.querySelector('#equipmentTable tbody').appendChild(newRow);
        equipmentIndex++;
        newRow.querySelector('input').focus();
    });

    // Remove row functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const rows = document.querySelectorAll('.equipment-row');
            if (rows.length > 1) {
                e.target.closest('tr').remove();
                updateInputNames();
                equipmentIndex = document.querySelectorAll('.equipment-row').length;
            } else {
                alert('You must have at least one equipment item.');
            }
        }
    });

    // Real-time calculations
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name^="power_"], input[name^="runtime_"], input[name^="quantity_"]')) {
            updateTotalConsumption();
        }
    });

    // Update input names after row removal
    function updateInputNames() {
        document.querySelectorAll('.equipment-row').forEach((row, index) => {
            row.querySelectorAll('input').forEach(input => {
                const name = input.name.split('_')[0];
                input.name = `${name}_${index}`;
            });
        });
    }

    // Calculate total power consumption
    function updateTotalConsumption() {
        let totalWatts = 0;
        
        document.querySelectorAll('.equipment-row').forEach(row => {
            const power = parseFloat(row.querySelector('input[name^="power_"]').value) || 0;
            const runtime = parseFloat(row.querySelector('input[name^="runtime_"]').value) || 0;
            const quantity = parseFloat(row.querySelector('input[name^="quantity_"]').value) || 0;
            
            totalWatts += (power * runtime * quantity);
        });

        const totalDisplay = document.getElementById('totalConsumption') || createTotalDisplay();
        totalDisplay.textContent = `Total Daily Consumption: ${totalWatts.toFixed(2)} Watt-hours`;
    }

    // Create total consumption display
    function createTotalDisplay() {
        const div = document.createElement('div');
        div.id = 'totalConsumption';
        div.className = 'total-calculation';
        document.querySelector('#equipmentForm').appendChild(div);
        return div;
    }

    // Form validation
    document.getElementById('equipmentForm').addEventListener('submit', function(e) {
        let isValid = true;
        
        document.querySelectorAll('.equipment-row input[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields (marked in red).');
        }
    });
});