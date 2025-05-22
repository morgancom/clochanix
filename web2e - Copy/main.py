from flask import Flask, redirect, url_for
from flask_talisman import Talisman
from werkzeug.middleware.proxy_fix import ProxyFix
from electricNew.app import app as electract_app
from solarcal2.app import app as solar_app 
from billsread.app import app as bills_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple
import os
from dotenv import load_dotenv

# Load environment variables from .env in electricNew folder
load_dotenv(os.path.join('electricNew', '.env'))

# Create the main application
app = Flask(__name__)

# Add security headers
Talisman(app,
    force_https=False,  # Disable HTTPS requirement
    session_cookie_secure=False,  # Allow non-HTTPS cookies
    content_security_policy={
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:', 'http:'],  # Allow HTTP
        'script-src': ["'self'", "'unsafe-inline'", 'https:', 'http:'],  # Allow HTTP
        'style-src': ["'self'", "'unsafe-inline'", 'https:', 'http:', 'https://fonts.googleapis.com', 'https://unpkg.com'],
        'connect-src': ["'self'", 'http:', 'https:']  # Allow HTTP connections
    }
)

# Handle proxy headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

@app.route('/')
def index():
    return redirect('/electrical')  # Redirect root to electrical app

# Register the applications with their URL prefixes 
application = DispatcherMiddleware(app, {
    '/electrical': electract_app,  # Main electrical site
    '/solar': solar_app,          # Solar calculator 
    '/bills': bills_app           # Bills calculator
})

if __name__ == '__main__':
    # Run the combined application
    run_simple('0.0.0.0', 5000, application,
               use_reloader=True,
               use_debugger=True,
               threaded=True)
