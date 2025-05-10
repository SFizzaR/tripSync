from flask import Flask
from flask_cors import CORS
from weather_controller import weather_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}) 

# Debug: Catch import errors
try:
    app.register_blueprint(weather_bp)
    print("Successfully registered weather_bp blueprint")
except Exception as e:
    print(f"Failed to register weather_bp: {str(e)}")

# Print routes when the app starts
print("Registered routes:")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule}")

# Test route
@app.route('/test', methods=['GET'])
def test_route():
    return "Flask app is running!", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)