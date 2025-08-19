from flask import Blueprint, request, jsonify

main = Blueprint("main", __name__)

# GET route
@main.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello vro!"})

# POST route
@main.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # parse JSON body
    username = data.get("username")
    password = data.get("password")

    # fake auth check
    if username == "admin" and password == "123":
        return jsonify({"status": "success", "user": username})
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
