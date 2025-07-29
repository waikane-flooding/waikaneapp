from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import subprocess
from datetime import datetime

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# File paths
BASE_DIR = os.path.dirname(__file__)
WAIKANE_TIDE_FILE = os.path.join(BASE_DIR, 'Waikane_Tide_Data.json')
WAIKANE_STREAM_FILE = os.path.join(BASE_DIR, 'Waikane_Stream_Data.json')
WAIAHOLE_STREAM_FILE = os.path.join(BASE_DIR, 'Waiahole_Stream_Data.json')
WAIKANE_TIDE_CURVE_FILE = os.path.join(BASE_DIR, 'Waikane_Tide_Curve.json')

def update_data():
    try:
        subprocess.run(["python", "run_notebook.py"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print("Notebook execution failed:", e)
        return False

@app.route('/api/waikane_tides', methods=['GET'])
def get_waikane_tide_data():
    update_data()  # Update data before serving
    try:
        with open(WAIKANE_TIDE_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/waikane_stream', methods=['GET'])
def get_waikane_stream_data():
    update_data()  # Update data before serving
    try:
        with open(WAIKANE_STREAM_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/waiahole_stream', methods=['GET'])
def get_waiahole_stream_data():
    update_data()  # Update data before serving
    try:
        with open(WAIAHOLE_STREAM_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/waikane_tide_curve', methods=['GET'])
def get_waikane_tide_curve():
    update_data()  # Update data before serving
    try:
        with open(WAIKANE_TIDE_CURVE_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
