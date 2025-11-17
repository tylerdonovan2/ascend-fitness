from flask import Flask, render_template_string, request, redirect, flash, session, send_from_directory
import sqlite3, re, os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "C8A0E2F6792B4A79D91A23FDD98C"
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
        flash("Password must be 8+ chars, include upper/lowercase, number, and symbol.")
        return redirect("/signup")

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, generate_password_hash(pw))
        )
        conn.commit()
        flash("Account created successfully!")
        return redirect("/login")
    except sqlite3.IntegrityError:
        flash("Email already exists.")
        return redirect("/signup")

@app.route("/do_login", methods=["POST"])
def do_login():
    email = request.form["email"]
    pw = request.form["password"]
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user and check_password_hash(user["password_hash"], pw):
        session["user"] = user["username"]
        flash("Login successful!")
        return redirect("/")
    else:
        flash("Invalid email or password.")
        return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)
