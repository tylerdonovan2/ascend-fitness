from flask import Flask, render_template_string, request, redirect, flash, session, send_from_directory, jsonify
import sqlite3, re, os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from PIL import Image
import io
from pyzbar.pyzbar import decode

app = Flask(__name__)
app.secret_key = "C8A0E2F6792B4A79D91A23FDD98C"
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

create_tables()

def valid_password(pw):
    return (
        len(pw) >= 8 and
        re.search(r"[A-Z]", pw) and
        re.search(r"[a-z]", pw) and
        re.search(r"[0-9]", pw) and
        re.search(r"[!@#$%^&*()_+=\-]", pw)
    )

@app.route("/styles/<path:filename>")
def styles(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), "styles"), filename)

@app.route("/<path:filename>")
def root_files(filename):
    return send_from_directory(os.path.dirname(__file__), filename)

@app.route("/")
def index():
    with open("index.html") as f:
        return render_template_string(f.read())

@app.route("/signup")
def signup():
    with open("signup.html") as f:
        return render_template_string(f.read())

@app.route("/login")
def login():
    with open("login.html") as f:
        return render_template_string(f.read())

@app.route("/do_signup", methods=["POST"])
def do_signup():
    username = request.form["username"]
    email = request.form["email"]
    pw = request.form["password"]

    if not valid_password(pw):
        return redirect("https://tylerdonovan2.github.io/ascend-fitness/signup?error=Password%20must%20be%208%2B%20chars%2C%20include%20upper%2Flowercase%2C%20number%2C%20and%20symbol.")

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, generate_password_hash(pw))
        )
        conn.commit()
        flash("Account created successfully!")
        return redirect("https://tylerdonovan2.github.io/ascend-fitness/login/")
    except sqlite3.IntegrityError:
        return redirect("https://tylerdonovan2.github.io/ascend-fitness/signup?error=Email%20already%20exists.")

@app.route("/do_login", methods=["POST"])
def do_login():
    email = request.form["email"]
    pw = request.form["password"]
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user and check_password_hash(user["password_hash"], pw):
        session["user"] = user["username"]
        flash("Login successful!")
        return redirect("https://tylerdonovan2.github.io/ascend-fitness/")
    else:
        return redirect("https://tylerdonovan2.github.io/ascend-fitness/login?error=Invalid%20email%20or%20password.")

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

if __name__ == "__main__":
    app.run(debug=True)
