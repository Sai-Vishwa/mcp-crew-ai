from flask import Blueprint, request, jsonify
from .controllers.login.login import login_controller
from .controllers.bot_page.bot_page import botpage_controller
from .controllers.bot_page.sub_controllers.load_chat_history import load_chat_history_controller

import asyncio
main = Blueprint("main", __name__)

# GET route
@main.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello vro!"})

# POST route
@main.route("/login", methods=["POST"])
async def login():
    data = request.get_json()
    return await login_controller(data)

@main.route("/bot-page", methods=["POST"])
async def botPage():
    data = request.get_json()
    return await botpage_controller(data)

@main.route("/load-chats", methods=["POST"])
async def loadChats():
    data = request.get_json()
    return await load_chat_history_controller(data)
