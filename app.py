from flask import Flask, render_template, request

app = Flask(__name__, template_folder='.', static_folder='styles')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        # for now, just show what was entered
        return f"Login attempt with email: {email}"
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        # for now, just show what was entered
        return f"Account created for: {username}"
    return render_template('signup.html')

if __name__ == '__main__':
    app.run(debug=True)
