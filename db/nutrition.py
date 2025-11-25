
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pyzbar.pyzbar import decode
import io

app = Flask(__name__)
CORS(app)





if __name__ == '__main__':
    app.run(debug=True)
