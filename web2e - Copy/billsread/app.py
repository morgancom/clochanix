from flask import Flask, render_template, request, redirect, url_for, flash, session, send_file
from flask_mail import Mail, Message
import os
import logging
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

# Configure mail settings
app.config.update(
    SECRET_KEY='your-secret-key-here',
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME='michaeldaron191@gmail.com',
    MAIL_PASSWORD='pbcq iczy telx qjom',
    MAIL_DEFAULT_SENDER='morgangeorge608@gmail.com'
)

# Initialize mail
mail = Mail(app)

app.secret_key = os.urandom(24)  # Required for flashing messages

@app.route('/')
def home():
    return redirect(url_for('bill_calculator'))

@app.route('/calculator', methods=['GET', 'POST'])
def bill_calculator():
    current_year = datetime.now().year
    if request.method == 'POST':
        try:
            previous_reading = float(request.form['previous_reading'])
            current_reading = float(request.form['current_reading'])
            cost_per_unit = float(request.form['cost_per_unit'])
            
            if previous_reading < 0 or current_reading < 0 or cost_per_unit < 0:
                flash('Please enter positive values for all fields.')
                return redirect(url_for('bill_calculator'))
            
            if current_reading < previous_reading:
                flash('Current reading must be greater than previous reading.')
                return redirect(url_for('bill_calculator'))
            
            units_consumed = current_reading - previous_reading
            total_amount = units_consumed * cost_per_unit
            
            # Store values in session
            session['previous_reading'] = previous_reading
            session['current_reading'] = current_reading
            session['cost_per_unit'] = cost_per_unit
            session['units_consumed'] = units_consumed
            session['total_amount'] = total_amount
            
            return render_template('results.html', 
                                 previous_reading=previous_reading,
                                 current_reading=current_reading,
                                 cost_per_unit=cost_per_unit,
                                 units_consumed=units_consumed,
                                 total_amount=total_amount,
                                 current_year=current_year)
            
        except ValueError:
            flash('Please enter valid numbers for all fields.')
            return redirect(url_for('bill_calculator'))
    
    return render_template('electricity_bill.html', current_year=current_year)

@app.route("/terms")
def terms():
    current_year = datetime.now().year
    return render_template("terms.html", current_year=current_year)

@app.route("/privacy")
def privacy():
    current_year = datetime.now().year
    return render_template("privacy.html", current_year=current_year)

@app.route('/download_pdf')
def download_pdf():
    # Recreate the data from the session (if needed)
    if 'previous_reading' not in session or 'current_reading' not in session or 'cost_per_unit' not in session:
        return redirect(url_for('bill_calculator'))
    
    previous_reading = session['previous_reading']
    current_reading = session['current_reading']
    cost_per_unit = session['cost_per_unit']
    units_consumed = session['units_consumed']
    total_amount = session['total_amount']
    
    # Create PDF with enhanced styling
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    elements = []
    styles = getSampleStyleSheet()
    
    # Add company logo and header
    company_name = Paragraph(
        """<para alignment="center">
           <font size="16" color="#062ffc"><b>CLOCHANIX BILLS</b></font><br/>
           <font size="12">Smart Bill Calculator & Management</font>
           </para>""",
        styles["Normal"]
    )
    elements.append(company_name)
    elements.append(Spacer(1, 20))
    
    # Add bill information with date
    bill_date = datetime.now().strftime("%B %d, %Y")
    bill_info = Paragraph(
        f"""<para alignment="right">
           <font size="11">Bill Date: {bill_date}<br/>
           Reference: CBL-{datetime.now().strftime('%Y%m%d%H%M')}</font>
           </para>""",
        styles["Normal"]
    )
    elements.append(bill_info)
    elements.append(Spacer(1, 20))

    # Create table with improved styling
    data = [
        ['Item', 'Value'],
        ['Previous Meter Reading', f"{previous_reading:,.2f} units"],
        ['Current Meter Reading', f"{current_reading:,.2f} units"],
        ['Cost per Unit', f"{cost_per_unit:,.2f} XAF"],
        ['Total Units Consumed', f"{units_consumed:,.2f} units"],
        ['Total Amount to be Paid', f"{total_amount:,.2f} XAF"]
    ]
    
    table = Table(data, colWidths=[300, 200])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#062ffc')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0f0f0')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#062ffc')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 30))
    
    # Add footer with contact information
    footer_text = Paragraph(
        """<para alignment="center">
           <font size="9" color="#666666">
           Contact: +237 680-547-526 | Email: clovissamba191@gmail.com<br/>
           Limbe, Cameroon<br/>
           Thank you for using Clochanix Bills
           </font>
           </para>""",
        styles["Normal"]
    )
    elements.append(footer_text)
    
    doc.build(elements)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'electricity_bill_{datetime.now().strftime("%Y%m%d")}.pdf'
    )

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            # Get form data
            form_data = {
                'name': request.form.get('name'),
                'email': request.form.get('email'),
                'phone': request.form.get('phone'),
                'message': request.form.get('message')
            }

            # Send email to business
            msg = Message(
                subject=f"New Bills Calculator Contact Form Message from {form_data['name']}",
                sender=app.config['MAIL_USERNAME'],
                recipients=[app.config['MAIL_DEFAULT_SENDER']],
                reply_to=form_data['email'],
                body=f"""
New Contact Form Submission (Bills Calculator):
--------------------------------------------
Name: {form_data['name']}
Email: {form_data['email']}
Phone: {form_data['phone']}

Message:
{form_data['message']}
                """
            )
            mail.send(msg)

            # Send confirmation to customer
            confirmation = Message(
                subject="Thank you for contacting Clochanix Bills",
                sender=app.config['MAIL_USERNAME'],
                recipients=[form_data['email']],
                body=f"""
Dear {form_data['name']},

Thank you for contacting Clochanix Bills Calculator service. We have received your message and will get back to you shortly.

Best regards,
Clochanix Team
Contact: +237 680 547 526
                """
            )
            mail.send(confirmation)

            flash('Your message has been sent successfully!', 'success')
            return redirect(url_for('contact'))
            
        except Exception as e:
            flash('An error occurred while sending your message. Please try again.', 'error')
            return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/submit-service-request', methods=['POST'])
def submit_service_request():
    try:
        # Get form data
        form_data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'service': request.form.get('service'),
            'details': request.form.get('details', '')
        }

        # Send notification to business
        business_msg = Message(
            subject=f"New Bill Calculator Service Request from {form_data['name']}",
            sender=app.config['MAIL_USERNAME'],
            recipients=['morgangeorge608@gmail.com'],
            reply_to=form_data['email'],
            body=f"""
New Bill Calculator Service Request:
--------------------------------
Name: {form_data['name']}
Email: {form_data['email']}
Phone: {form_data['phone']}

Service Type: {form_data['service']}

Details:
{form_data['details']}
            """
        )
        mail.send(business_msg)

        # Send confirmation to customer
        customer_msg = Message(
            subject="Bill Calculator Service Request Received",
            sender=app.config['MAIL_USERNAME'],
            recipients=[form_data['email']],
            body=f"""
Dear {form_data['name']},

Thank you for requesting our bill calculator service. We have received your request and will contact you shortly.

Your Request Details:
-------------------
Service: {form_data['service']}

If you need immediate assistance, please call:
Phone: +237 680 547 526

Best regards,
Clochanix Team
            """
        )
        mail.send(customer_msg)

        flash('Your service request has been sent successfully!', 'success')
        return redirect(url_for('bill_calculator'))

    except Exception as e:
        flash('An error occurred while sending your request. Please try again.', 'error')
        return redirect(url_for('bill_calculator'))

if __name__ == '__main__':
    app.run(debug=True)
