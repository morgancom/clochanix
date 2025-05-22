from flask import Flask, render_template, request, redirect, url_for, session, send_file, flash, abort
import os
from io import BytesIO
from datetime import datetime, timedelta
from functools import wraps
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch, cm

# Enhanced configuration
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))
    SESSION_LIFETIME = 30  # minutes
    PEAK_SUN_HOURS = 5.0
    SYSTEM_BUFFER = 0.25
    BATTERY_DOD = 0.60
    INVERTER_EFFICIENCY_RANGE = (0.90, 0.98)
    VOLTAGE_OPTIONS = [12, 24, 48]
    MAX_EQUIPMENT = 20
    TEMPERATURE_LOSS = 0.90
    DUST_LOSS = 0.95
    SURGE_FACTOR = 1.3
    TEMP_COMPENSATION = 1.1
    
    # System size ranges for voltage recommendations
    VOLTAGE_RANGES = {
        12: {'min': 0, 'max': 1000},  # 0-1kW
        24: {'min': 1000, 'max': 3000},  # 1-3kW
        48: {'min': 3000, 'max': float('inf')}  # >3kW
    }

app = Flask(__name__)
app.config.from_object(Config)
app.permanent_session_lifetime = timedelta(minutes=Config.SESSION_LIFETIME)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def require_session_data(*required_keys):
    """Decorator to check for required session data"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            missing = [key for key in required_keys if key not in session]
            if missing:
                flash(f'Missing required data: {", ".join(missing)}', 'error')
                return redirect(url_for('equipment'))
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Helper functions
def calculate_system_parameters(equipment_list, voltage, inverter_efficiency, peak_sun_hours):
    """Calculate all system parameters with enhanced accuracy"""
    try:
        # Calculate total energy with safety margin
        total_energy = sum(item['power'] * item['runtime'] * item['quantity'] 
                         for item in equipment_list)
        
        # Solar panel calculation with environmental factors
        solar_panel_power = (total_energy / peak_sun_hours) * (1 + Config.SYSTEM_BUFFER) / (
            Config.TEMPERATURE_LOSS * Config.DUST_LOSS
        )
        
        # Battery calculation with temperature compensation
        usable_ah = (total_energy / voltage) * Config.TEMP_COMPENSATION
        total_battery_ah = usable_ah / Config.BATTERY_DOD
        
        # Inverter sizing with surge protection
        total_power_demand = sum(item['power'] * item['quantity'] for item in equipment_list)
        inverter_capacity = (total_power_demand / inverter_efficiency) * Config.SURGE_FACTOR
        
        return {
            'total_energy': total_energy,
            'solar_panel_power': solar_panel_power,
            'usable_ah': usable_ah,
            'total_battery_ah': total_battery_ah,
            'total_power_demand': total_power_demand,
            'inverter_capacity': inverter_capacity
        }
    except Exception as e:
        logger.error(f"Error calculating system parameters: {str(e)}")
        raise

# Routes
@app.route('/')
def index():
    return redirect(url_for('equipment'))

@app.route('/solar/equipment', methods=['GET', 'POST'])
def equipment():
    if request.method == 'POST':
        equipment_list = []
        # Process form data
        index = 0
        while True:
            name = request.form.get(f'name_{index}')
            power_str = request.form.get(f'power_{index}')
            runtime_str = request.form.get(f'runtime_{index}')
            quantity_str = request.form.get(f'quantity_{index}', 1)
            
            if not name:
                break
            
            try:
                power = float(power_str)
                runtime = float(runtime_str)
                quantity = int(quantity_str)
                if power <= 0 or runtime <= 0 or runtime > 24 or quantity <= 0:
                    raise ValueError("Invalid input")
                equipment_list.append({
                    'name': name, 
                    'power': power, 
                    'runtime': runtime,
                    'quantity': quantity
                })
            except (ValueError, TypeError):
                return "Error: Invalid input. Please ensure power, runtime, and quantity are positive numbers."
            
            index += 1
        
        session['equipment'] = equipment_list
        return redirect(url_for('battery'))
    
    # Clear session data
    session.pop('equipment', None)
    session.pop('voltage', None)
    session.pop('inverter_efficiency', None)
    return render_template('equipment.html')

@app.route('/solar/battery', methods=['GET', 'POST'])
@require_session_data('equipment')
def battery():
    if request.method == 'POST':
        try:
            voltage = int(request.form['voltage'])
            if voltage not in Config.VOLTAGE_OPTIONS:
                raise ValueError("Invalid voltage selection")
            
            # Validate voltage selection based on system size
            total_power = sum(item['power'] * item['quantity'] 
                            for item in session['equipment'])
            
            voltage_range = Config.VOLTAGE_RANGES[voltage]
            if not voltage_range['min'] <= total_power <= voltage_range['max']:
                flash(f'Warning: {voltage}V may not be optimal for your system size', 'warning')
            
            session['voltage'] = voltage
            return redirect(url_for('location'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
            return redirect(url_for('battery'))
    
    return render_template('battery.html')

@app.route('/solar/location', methods=['GET', 'POST'])
def location():
    if 'equipment' not in session or 'voltage' not in session:
        return redirect(url_for('equipment'))
    
    if request.method == 'POST':
        try:
            peak_sun_hours = float(request.form['peak_sun_hours'])
            if peak_sun_hours <= 0 or peak_sun_hours > 24:
                raise ValueError
            session['peak_sun_hours'] = peak_sun_hours
            return redirect(url_for('inverter'))
        except (ValueError, KeyError):
            return "Error: Invalid peak sun hours. Please enter a value between 0 and 24."
    
    return render_template('location.html')

@app.route('/solar/inverter', methods=['GET', 'POST'])
def inverter():
    if 'equipment' not in session or 'voltage' not in session:
        return redirect(url_for('equipment'))
    
    if request.method == 'POST':
        try:
            efficiency_str = request.form['efficiency']
            efficiency = float(efficiency_str)
            if efficiency < 90 or efficiency > 98:
                raise ValueError
            session['inverter_efficiency'] = efficiency / 100.0
            return redirect(url_for('results'))
        except (ValueError, KeyError):
            return "Error: Invalid inverter efficiency. Please enter a value between 90 and 98."
    
    return render_template('inverter.html')

@app.route('/solar/results')
@require_session_data('equipment', 'voltage', 'inverter_efficiency', 'peak_sun_hours')
def results():
    try:
        params = calculate_system_parameters(
            session['equipment'],
            session['voltage'],
            session['inverter_efficiency'],
            session['peak_sun_hours']
        )
        
        return render_template('results.html',
                             equipment=session['equipment'],
                             voltage=session['voltage'],
                             inverter_efficiency=session['inverter_efficiency'] * 100,
                             peak_sun_hours=session['peak_sun_hours'],
                             **params,
                             assumptions={
                                 'sun_hours': session['peak_sun_hours'],
                                 'buffer': f"{Config.SYSTEM_BUFFER*100}%",
                                 'dod': f"{Config.BATTERY_DOD*100}%",
                                 'temp_loss': f"{(1-Config.TEMPERATURE_LOSS)*100}%",
                                 'dust_loss': f"{(1-Config.DUST_LOSS)*100}%"
                             })
    except Exception as e:
        logger.error(f"Error in results route: {str(e)}")
        flash('Error calculating results. Please try again.', 'error')
        return redirect(url_for('equipment'))

@app.route('/solar/download-pdf')
def download_pdf():
    if 'equipment' not in session or 'voltage' not in session or 'inverter_efficiency' not in session:
        return redirect(url_for('equipment'))
    
    equipment_list = session['equipment']
    voltage = session['voltage']
    inverter_efficiency = session['inverter_efficiency']
    
    # Calculate values
    total_energy = sum(item['power'] * item['runtime'] * item['quantity'] for item in equipment_list)
    solar_panel_power = (total_energy / Config.PEAK_SUN_HOURS) * (1 + Config.SYSTEM_BUFFER)
    usable_ah = total_energy / voltage
    total_battery_ah = usable_ah / Config.BATTERY_DOD
    total_power_demand = sum(item['power'] * item['quantity'] for item in equipment_list)
    inverter_capacity = total_power_demand / inverter_efficiency
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, 
                          pagesize=letter,
                          leftMargin=72,
                          rightMargin=72,
                          topMargin=72,
                          bottomMargin=72,
                          title="Clochanix Solar Calculation Results")
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Add company header
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    elements.append(Paragraph("CLOCHANIX SOLAR", header_style))
    elements.append(Paragraph("Solar Power System Calculation Results", styles['Title']))
    elements.append(Spacer(1, 20))
    
    # Add date and reference number
    date_style = ParagraphStyle('Date', parent=styles['Normal'], alignment=2)  # Right align
    elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", date_style))
    elements.append(Paragraph(f"Reference: SOL-{datetime.now().strftime('%Y%m%d%H%M')}", date_style))
    elements.append(Spacer(1, 20))

    # Equipment Table
    elements.append(Paragraph("Equipment List", styles['Heading2']))
    table_data = [['Equipment', 'Quantity', 'Power (W)', 'Runtime (h)', 'Daily Energy (Wh)']]
    for item in equipment_list:
        table_data.append([
            item['name'],
            str(item['quantity']),
            f"{item['power']}",
            f"{item['runtime']}",
            f"{(item['power'] * item['runtime'] * item['quantity']):.2f}"
        ])
    table_data.append(['', '', '', 'Total:', f"{total_energy:.2f}"])
    equipment_table = Table(table_data)
    equipment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(equipment_table)
    elements.append(Spacer(1, 12))
    
    # Solar Panel Requirements
    elements.append(Paragraph("Solar Panel Requirements", styles['Heading2']))
    solar_data = [
        ['Assumptions:', ''],
        ['Average Peak Sun Hours:', f"{Config.PEAK_SUN_HOURS} hours"],
        ['System Buffer:', f"{Config.SYSTEM_BUFFER*100}%"],
        ['Estimated Solar Panel Power:', f"{solar_panel_power:.2f} W"]
    ]
    solar_table = Table(solar_data)
    solar_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(solar_table)
    elements.append(Spacer(1, 12))
    
    # Battery Requirements
    elements.append(Paragraph("Battery Requirements", styles['Heading2']))
    battery_data = [
        ['Assumptions:', ''],
        ['Battery Voltage:', f"{voltage} V"],
        ['Depth of Discharge (DoD):', f"{Config.BATTERY_DOD*100}%"],
        ['Usable Battery Capacity:', f"{usable_ah:.2f} Ah"],
        ['Total Required Battery Capacity:', f"{total_battery_ah:.2f} Ah"]
    ]
    battery_table = Table(battery_data)
    battery_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(battery_table)
    elements.append(Spacer(1, 12))
    
    # Inverter Requirements
    elements.append(Paragraph("Inverter Requirements", styles['Heading2']))
    inverter_data = [
        ['Assumptions:', ''],
        ['Inverter Efficiency:', f"{inverter_efficiency*100:.2f}%"],
        ['Total Power Demand:', f"{total_power_demand:.2f} W"],
        ['Estimated Inverter Capacity:', f"{inverter_capacity:.2f} W"]
    ]
    inverter_table = Table(inverter_data)
    inverter_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(inverter_table)
    elements.append(Spacer(1, 12))
    
    # Note
    elements.append(Paragraph("Note: These calculations are estimates. Actual requirements may vary based on location, equipment usage, and system efficiency. Consult a solar professional for precise design.", styles['Normal']))
    
    # Add customer and company information section
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Agreement Details", styles['Heading2']))
    
    # Create blue color style for names
    blue_style = ParagraphStyle(
        'BlueText',
        parent=styles['Normal'],
        textColor=colors.HexColor('#0052cc'),
        fontSize=12,
        fontName='Helvetica-Bold'
    )
    
    # Customer and Company Information Table
    info_data = [
        ['CUSTOMER DETAILS', 'COMPANY DETAILS'],
        ['Full Name: _____________________', 'Company: Clochanix Solar'],
        ['ID/Passport: _________________', 'Reg. Number: CS-2024-001'],
        ['Phone: ____________________', 'Phone: +237 680-547-526'],
        ['Email: ____________________', 'Email: clovissamba191@gmail.com'],
        ['Address: ____________________', 'Location: Limbe, Cameroon'],
        ['City: ______________________', 'Region: South West Region'],
        ['Country: ___________________', 'Country: Cameroon']
    ]
    
    info_table = Table(info_data, colWidths=[250, 250])
    info_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor('#0052cc')),  # Company name in blue
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    # Updated signature section with blue names
    elements.append(Spacer(1, 40))
    sig_data = [
        ['CUSTOMER SIGNATURE', 'COMPANY REPRESENTATIVE'],
        ['Sign: ____________________', 'Sign: ____________________'],
        ['Full Name: ____________________', 'Full Name: ____________________'],
        ['ID/Passport: ______________', 'Staff ID: _________________'],
        ['Location: _______________', 'Branch: Limbe Office'],
        ['Date: ____________________', 'Date: ____________________']
    ]
    sig_table = Table(sig_data, colWidths=[250, 250])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('TOPPADDING', (0, 1), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('TEXTCOLOR', (0, 2), (1, 2), colors.HexColor('#0052cc')),  # Names in blue
    ]))
    elements.append(sig_table)
    
    # Witness section with blue names
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Witness", styles['Heading3']))
    witness_data = [
        ['Full Name: ____________________', 'ID Number: _________________'],
        ['Location: ____________________', 'Phone: _____________________'],
        ['Sign: ____________________', 'Date: _____________________']
    ]
    witness_table = Table(witness_data, colWidths=[250, 250])
    witness_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#0052cc')),  # Witness name in blue
    ]))
    elements.append(witness_table)
    
    # Add agreement section
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Terms of Agreement", styles['Heading2']))
    agreement_text = """
    1. This document represents an estimated calculation of solar power requirements.
    2. Final system specifications  vary based on detailed site assessment.
    3. All installations will be performed by qualified technicians.
    4. Warranty terms and conditions apply as per manufacturer specifications.
    5. System maintenance and support services will be provided as per contract terms.
    6. Customer agrees to provide accurate information for the calculation.
    7. Clochanix Solar is not liable for any damages or losses incurred due to incorrect information.
    8. Customer agrees to the terms and conditions outlined in this document.
    9. This agreement is valid for 30 days from the date of issue.
    10. Any changes to the equipment list or specifications must be communicated to Clochanix Solar.
    11. Customer acknowledges that solar energy production may vary based on environmental factors.
    """
    elements.append(Paragraph(agreement_text, styles['Normal']))
    
    # Add signature section
    elements.append(Spacer(1, 40))
    sig_data = [
        ['____________________', '____________________'],
        ['Customer Signature', 'Company Representative'],
        ['Date: _____________', 'Date: _____________'],
    ]
    sig_table = Table(sig_data, colWidths=[250, 250])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 0), (0, 0)),
        ('SPAN', (1, 0), (1, 0)),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 12),
    ]))
    elements.append(sig_table)
    
    # Add footer
    footer_text = """
    Clochanix Solar
    Phone: +237 680-547-526 | Email: clovissamba191@gmail.com
    Location: Limbe, Cameroon
    """
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.gray,
        alignment=1  # Center alignment
    )
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(footer_text, footer_style))
    
    doc.build(elements)
    buffer.seek(0)
    
    # Generate unique filename with timestamp
    filename = f"Clochanix_Solar_Calculation_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )

@app.route("/terms")
def terms():
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template("terms.html", current_date=current_date)

@app.route("/privacy")
def privacy():
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template("privacy.html", current_date=current_date)

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true',
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5000)))