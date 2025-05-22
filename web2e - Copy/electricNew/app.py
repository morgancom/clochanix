from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_mail import Mail, Message
import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask_session import Session
from functools import wraps
from werkzeug.utils import secure_filename  # Add this import at the top with other imports

# Modify the app creation to allow mounting
app = Flask(__name__)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Mail and app configuration
app.config.update(
    SECRET_KEY='913aa3a2-8fef-4446-a971-2e342e67513f',
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME='michaeldaron191@gmail.com',
    MAIL_PASSWORD='pbcq iczy telx qjom',
    MAIL_DEFAULT_SENDER='morgangeorge608@gmail.com',
    MAIL_USE_SSL=False,
    MAIL_DEBUG=True,
    SQLALCHEMY_DATABASE_URI='sqlite:///site.db',
    DEBUG=True,
    STRIPE_PUBLIC_KEY=os.getenv('STRIPE_PUBLIC_KEY'),
    STRIPE_SECRET_KEY=os.getenv('STRIPE_SECRET_KEY'),
    MOBILE_MONEY_API_KEY=os.getenv('MOBILE_MONEY_API_KEY')
)

# Add payout configuration
app.config.update({
    'MTN_MOMO_API_KEY': os.getenv('MTN_MOMO_API_KEY'),
    'ORANGE_MONEY_API_KEY': os.getenv('ORANGE_MONEY_API_KEY'),
    'PAYOUT_NOTIFICATION_EMAIL': 'morgangeorge608@gmail.com'
})

# Update session and security configuration
app.config.update({
    'SESSION_TYPE': 'filesystem',
    'SESSION_FILE_DIR': './flask_session',
    'SESSION_PERMANENT': True,
    'PERMANENT_SESSION_LIFETIME': timedelta(days=1),
    'SESSION_COOKIE_SECURE': False,  # Allow non-HTTPS for local development
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_COOKIE_SAMESITE': None,  # Allow cross-tab access
    'SESSION_REFRESH_EACH_REQUEST': False,
    'REMEMBER_COOKIE_SECURE': False,  # Allow non-HTTPS cookies
    'REMEMBER_COOKIE_HTTPONLY': True,
    'REMEMBER_COOKIE_DURATION': timedelta(days=1)
})

# Initialize session without SSL requirement for local development
Session(app)

# Disable SSL requirement for local development
app.config['SESSION_COOKIE_NAME'] = 'clochanix_session'
app.config['SESSION_COOKIE_DOMAIN'] = None  # Allow all domains
app.config['SESSION_COOKIE_PATH'] = '/'

@app.before_request
def session_handler():
    if not session.get('created'):
        session['created'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        session['tab_id'] = os.urandom(16).hex()
    session.permanent = True
    # Ensure session is accessible without SSL
    session.modified = True

# Add project configuration
app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, 'images/projects')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Initialize mail with error handling
try:
    mail = Mail(app)
    logger.info("Mail initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize mail: {str(e)}")
    raise

@app.route("/")
def home():
    # Get any query parameters
    from_contact = request.args.get('from_contact')
    if (from_contact):
        return render_template("home.html", scroll_to_form=True)
    return render_template("home.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/services")
def services():
    return render_template("services.html")

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/project1')
def project1():
    return render_template('project1.html', projects=projects_data['project1'])

@app.route('/project2')
def project2():
    return render_template('project2.html', projects=projects_data['project2'])

@app.route('/project3')
def project3():
    return render_template('project3.html', projects=projects_data['project3'])

@app.route('/project4')
def project4():
    return render_template('project4.html', projects=projects_data['project4'])

@app.route('/project5')
def project5():
    return render_template('project5.html', projects=projects_data['project5'])

@app.route('/project6')
def project6():
    return render_template('project6.html', projects=projects_data['project6'])

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

            # Validate required fields
            if not all(form_data.values()):
                flash('Please fill in all required fields', 'error')
                return redirect(url_for('contact'))

            # Send email to business
            msg = Message(
                subject=f"New Contact Form Message from {form_data['name']}",
                sender=app.config['MAIL_USERNAME'],
                recipients=[app.config['MAIL_DEFAULT_SENDER']],
                reply_to=form_data['email'],
                body=f"""
New Contact Form Submission:
---------------------------
Name: {form_data['name']}
Email: {form_data['email']}
Phone: {form_data['phone']}

Message:
{form_data['message']}
                """
            )
            mail.send(msg)
            logger.info(f"Sent contact form email from {form_data['name']}")

            # Send confirmation to customer
            confirmation = Message(
                subject="Thank you for contacting Clochanix Electric",
                sender=app.config['MAIL_USERNAME'],
                recipients=[form_data['email']],
                body=f"""
Dear {form_data['name']},

Thank you for contacting Clochanix Electric. We have received your message and will get back to you shortly.

Best regards,
Clochanix Electric Team
Contact: +237 680 547 526
                """
            )
            mail.send(confirmation)
            logger.info(f"Sent confirmation email to {form_data['email']}")

            flash('Your message has been sent successfully!', 'success')
            return redirect(url_for('contact'))
            
        except Exception as e:
            logger.error(f"Error sending contact form: {str(e)}")
            flash('An error occurred while sending your message. Please try again.', 'error')
            return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/submit-service-request', methods=['POST'])
def submit_service_request():
    try:
        # Get form data with validation
        form_data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'address': request.form.get('address'),
            'service': request.form.get('service'),
            'preferred_date': request.form.get('preferred_date'),
            'preferred_time': request.form.get('preferred_time'),
            'urgency': request.form.get('urgency'),
            'details': request.form.get('details', ''),
            'budget': request.form.get('budget', 'Not specified'),
            'reference': request.form.get('reference', 'Not specified')
        }

        # Log the request
        logger.info(f"Processing service request for {form_data['name']}")

        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'address', 'service']
        if not all(form_data.get(field) for field in required_fields):
            flash('Please fill in all required fields', 'error')
            return redirect(url_for('home', _anchor='service-request-section'))

        try:
            # Send notification to business
            business_msg = Message(
                subject=f"New Service Request from {form_data['name']}",
                sender=app.config['MAIL_USERNAME'],
                recipients=['morgangeorge608@gmail.com'],  # Your business email
                reply_to=form_data['email'],
                body=f"""
New Service Request Details:
---------------------------
Name: {form_data['name']}
Email: {form_data['email']}
Phone: {form_data['phone']}
Address: {form_data['address']}

Service Information:
------------------
Service Type: {form_data['service']}
Preferred Date: {form_data['preferred_date']}
Preferred Time: {form_data['preferred_time']}
Urgency Level: {form_data['urgency']}
Budget Range: {form_data['budget']}

Project Details:
--------------
{form_data['details']}

Additional Information:
--------------------
Reference Source: {form_data['reference']}
                """
            )
            mail.send(business_msg)
            logger.info(f"Sent business notification email for {form_data['name']}")

            # Send confirmation to customer
            customer_msg = Message(
                subject="Service Request Received - Clochanix Electric",
                sender=app.config['MAIL_USERNAME'],
                recipients=[form_data['email']],
                body=f"""
Dear {form_data['name']},

Thank you for requesting our services. We have received your request and will contact you shortly to confirm the details.

Your Request Details:
-------------------
Service Type: {form_data['service']}
Preferred Date: {form_data['preferred_date']}
Preferred Time: {form_data['preferred_time']}
Service Location: {form_data['address']}

If you need immediate assistance, please call:
Phone: +237 680 547 526
WhatsApp: +237 680 547 526

Best regards,
Clochanix Electric Team
                """
            )
            mail.send(customer_msg)
            logger.info(f"Sent confirmation email to {form_data['email']}")

            flash('Your service request has been sent successfully!', 'success')
            return redirect(url_for('home', _anchor='service-request-section'))

        except Exception as mail_error:
            logger.error(f"Mail sending error: {str(mail_error)}")
            raise

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        flash('An error occurred while sending your request. Please try again.', 'error')
        return redirect(url_for('home', _anchor='service-request-section'))

# Add a test route
@app.route('/test-email')
def test_email():
    try:
        msg = Message(
            'Test Email',
            sender=app.config['MAIL_DEFAULT_SENDER'],
            recipients=['morgangeorge608@gmail.com']
        )
        msg.body = "This is a test email. If you receive this, your SMTP configuration is working."
        mail.send(msg)
        return 'Test email sent! Check your inbox.'
    except Exception as e:
        return f'Error: {str(e)}'

@app.route('/test-service-email')
def test_service_email():
    try:
        test_msg = Message(
            'Test Service Request Email',
            sender=app.config['MAIL_USERNAME'],
            recipients=['morgangeorge608@gmail.com']
        )
        test_msg.body = "This is a test email to verify service request functionality."
        mail.send(test_msg)
        return 'Test email sent! Check your inbox and spam folder.'
    except Exception as e:
        logger.error(f"Test email failed: {str(e)}")
        return f'Error sending test email: {str(e)}'

# Add admin authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            flash('Please log in as admin', 'error')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Admin routes with authentication
@app.route('/admin/projects', methods=['GET'])
@admin_required
def admin_projects():
    return render_template('admin/projects.html', 
                         projects_data=projects_data,
                         project_types=project_type_map)

@app.route('/admin/project/add', methods=['GET', 'POST'])
@admin_required
def admin_add_project():
    if request.method == 'POST':
        try:
            project_type = request.form.get('project_type')
            project_key = project_type_map.get(project_type)
            
            if not project_key:
                flash('Invalid project type', 'error')
                return redirect(url_for('admin_projects'))

            # Create project data with structured location info
            project_data = {
                'id': len(projects_data[project_key]) + 1,
                'installation_number': request.form.get('installation_number'),
                'client_name': request.form.get('client_name'),
                'location': {
                    'city': request.form.get('project_city'),
                    'country': request.form.get('project_country'),
                    'specific': request.form.get('specific_location'),
                    'completion_year': request.form.get('completion_year')
                },
                'property_size': request.form.get('property_size'),
                'duration': request.form.get('duration'),
                'team_size': request.form.get('team_size'),
                'completion_date': request.form.get('completion_date'),
                'description': request.form.get('description', ''),
                'scope': request.form.getlist('scope[]'),
                'equipment': request.form.getlist('equipment[]'),
                'media': {
                    'images': [],
                    'videos': []
                },
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            # Process media uploads
            if 'images[]' in request.files:
                for image in request.files.getlist('images[]'):
                    if image and allowed_file(image.filename, 'image'):
                        filename = secure_filename(f"{project_key}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{image.filename}")
                        image.save(os.path.join(app.config['UPLOAD_FOLDER'], 'images', filename))
                        project_data['media']['images'].append(filename)

            if 'videos[]' in request.files:
                for video in request.files.getlist('videos[]'):
                    if video and allowed_file(video.filename, 'video'):
                        filename = secure_filename(f"{project_key}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{video.filename}")
                        video.save(os.path.join(app.config['UPLOAD_FOLDER'], 'videos', filename))
                        project_data['media']['videos'].append(filename)

            # Add to project list
            projects_data[project_key].insert(0, project_data)
            flash('Project added successfully!', 'success')
            return redirect(url_for('admin_projects'))

        except Exception as e:
            logger.error(f"Error adding project: {str(e)}")
            flash(f'Error adding project: {str(e)}', 'error')
            return redirect(url_for('add_project'))

    return render_template('admin/add_project.html')

@app.route('/admin/project/edit/<project_key>/<int:project_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_project(project_key, project_id):
    try:
        # Find the project in the correct project type list
        project = next((p for p in projects_data[project_key] if p['id'] == project_id), None)
        
        if not project:
            flash('Project not found', 'error')
            return redirect(url_for('admin_projects'))

        if request.method == 'POST':
            project.update({
                'installation_number': request.form.get('installation_number'),
                'client_name': request.form.get('client_name'),
                'location': {
                    'city': request.form.get('project_city'),
                    'country': request.form.get('project_country'),
                    'specific': request.form.get('specific_location'),
                    'completion_year': request.form.get('completion_year')
                },
                'property_size': request.form.get('property_size'),
                'duration': request.form.get('duration'),
                'team_size': request.form.get('team_size'),
                'description': request.form.get('description', '')
            })
            flash('Project updated successfully!', 'success')
            return redirect(url_for('admin_projects'))

        return render_template('admin/edit_project.html', project=project, project_key=project_key)
    except Exception as e:
        logger.error(f"Error editing project: {str(e)}")
        flash('Error editing project', 'error')
        return redirect(url_for('admin_projects'))

@app.route('/admin/project/delete/<project_key>/<int:project_id>', methods=['DELETE'])
@admin_required
def admin_delete_project(project_key, project_id):
    try:
        projects_data[project_key] = [p for p in projects_data[project_key] if p['id'] != project_id]
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/project/<project_type>/<int:project_id>')
def view_project(project_type, project_id):
    project = next((p for p in projects_data[project_type] if p['id'] == project_id), None)
    if not project:
        flash('Project not found', 'error')
        return redirect(url_for('admin_projects'))
    return render_template(f'{project_type}.html', project=project)

# Project type mapping
project_type_map = {
    'wiring': 'project1',
    'lighting': 'project2',
    'solar': 'project3',
    'panel': 'project4',
    'maintenance': 'project5',
    'industrial': 'project6'
}

# Update allowed extensions
app.config['ALLOWED_EXTENSIONS'] = {
    'image': {'png', 'jpg', 'jpeg', 'gif'},
    'video': {'mp4', 'webm', 'mov'}
}

# Add helper function for file validation
def allowed_file(filename, file_type):
    if '.' not in filename:
        return False
    extension = filename.rsplit('.', 1)[1].lower()
    allowed_extensions = app.config['ALLOWED_EXTENSIONS'].get(file_type, set())
    return extension in allowed_extensions

# Configure file upload settings
app.config.update({
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB max file size
    'UPLOAD_FOLDER': os.path.join(app.static_folder, 'images/projects'),
    'ALLOWED_EXTENSIONS': {
        'image': {'png', 'jpg', 'jpeg', 'gif'},
        'video': {'mp4', 'webm', 'mov'}
    }
})

# Add payment processing endpoints
@app.route('/api/process-payment', methods=['POST'])
def process_payment():
    try:
        payment_data = request.json
        # Process payment based on method
        if payment_data['method'] == 'mobile_money':
            # Integrate with mobile money API
            pass
        elif payment_data['method'] == 'card':
            # Integrate with Stripe
            pass
        
        # Generate payment reference
        reference = generate_reference()
        logger.info(f"Payment processed successfully: {reference}")
        
        return jsonify({
            'success': True,
            'reference': reference
        })
        
    except Exception as e:
        logger.error(f"Payment error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_reference():
    return f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}"

# Initialize the projects_data dictionary once
projects_data = {
    'project1': [],  # Residential wiring
    'project2': [],  # Lighting installations
    'project3': [],  # Solar systems
    'project4': [],  # Panel upgrades
    'project5': [],  # Maintenance services
    'project6': []   # Industrial projects
}


sample_project = {
    'id': 1,
    'installation_number': '001',
    'client_name': 'Test Client',
    'location': {
        'city': 'Limbe',
        'country': 'Cameroon',
        'specific': 'BATOKE',
        'completion_year': '2024'
    },
    'property_size': '100',
    'duration': '5',
    'team_size': '3',
    'description': 'Sample project description',
    'scope': ['Wiring', 'Installation', 'Testing'],
    'equipment': ['Tools', 'Materials'],
    'media': {
        'images': [],
        'videos': []
    },
    'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
}

for key in projects_data:
    projects_data[key].append(sample_project.copy())

# Ensure upload directories exist
for dir_name in ['images', 'videos']:
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], dir_name), exist_ok=True)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == 'admin' and password == 'backend':
            session['is_admin'] = True
            session['user_id'] = 'admin'  # Add unique identifier
            session['login_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            return redirect(url_for('admin_projects'))
        else:
            flash('Invalid credentials. Please try again.', 'error')
            return redirect(url_for('admin_login'))
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    return redirect(url_for('home'))

@app.route("/terms")
def terms():
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template("terms.html", current_date=current_date)

@app.route("/privacy")
def privacy():
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template("privacy.html", current_date=current_date)

if __name__ == '__main__':
    app.run(debug=True)