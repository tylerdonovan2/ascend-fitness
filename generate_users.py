import sqlite3, random, string, os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

first = ["alex","sam","john","luke","chris","mike","ryan","jack","nick","trent","tyler","kevin","eric","dan","troy"]
last = ["stone","miller","johnson","twin","walker","adams","baker","turner","cooper","allen","brown","davis"]

def rand_name():
    return random.choice(first) + random.choice(last) + str(random.randint(1,99))

def rand_email(name):
    return name + "@gmail.com"

def rand_password():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(random.choice(chars) for _ in range(10))

conn = sqlite3.connect(DB_PATH)

for _ in range(50):
    username = rand_name()
    email = rand_email(username)
    pw_hash = generate_password_hash(rand_password())
    try:
        conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, pw_hash)
        )
    except:
        pass

conn.commit()
conn.close()

print("Generated 50 fake users successfully!")
