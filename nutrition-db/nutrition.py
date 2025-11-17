
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pyzbar.pyzbar import decode
import io

app = Flask(__name__)
CORS(app)


@app.route('/scan_barcode', methods=['POST'])
def scan_barcode():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image = Image.open(io.BytesIO(file.read()))

    results = decode(image)
    if not results:
        return jsonify({"success": False, "data": None})

    decoded_data = results[0].data.decode("utf-8")

    return jsonify({"success": True, "data": decoded_data})


if __name__ == '__main__':
    app.run(debug=True)
