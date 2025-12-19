import { pythonInstall } from '../common/install.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function flask(features = []) {
	const pythonImplementation = getServerImplementationGuide('python', features);

	return `${pythonInstall}

**Framework Documentation:**
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/python)

${serverSecurity}

${pythonImplementation}

## Flask-Specific Best Practices

### Application Factory Pattern

\`\`\`python
# app/__init__.py
from flask import Flask
from app.services.appwrite import init_appwrite

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # Initialize Appwrite client
    init_appwrite(app)
    
    # Register blueprints
    from app.routes import items
    app.register_blueprint(items.bp)
    
    return app
\`\`\`

### Request Context

\`\`\`python
# Use Flask's g object for request-scoped data
from flask import g

@app.before_request
def load_user():
    session_token = request.cookies.get('session')
    if session_token:
        g.user = verify_session(session_token)
    else:
        g.user = None
\`\`\`

### Error Handling

\`\`\`python
from appwrite.exception import AppwriteException

@app.errorhandler(AppwriteException)
def handle_appwrite_error(error):
    return jsonify({'error': error.message}), error.code
\`\`\`
`;
}
