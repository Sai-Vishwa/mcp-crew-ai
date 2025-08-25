from flask import Blueprint, request, jsonify
from .controllers.login.login import login_controller
from .controllers.bot_page.chat_page import chatpage_controller
from .controllers.bot_page.sub_controllers.load_chat_history import load_chat_history_controller
import time
from flask import Response, stream_with_context
import asyncio
import json

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

@main.route("/chat-page", methods=["POST"])
async def botPage():
    data = request.get_json()
    return await chatpage_controller(data)

@main.route("/load-chats", methods=["POST"])
async def loadChats():
    data = request.get_json()
    return await load_chat_history_controller(data)

# @main.route("/user-input", methods=["POST"])
# def giveResponse():
#     data = request.get_json()
    
#     def generate():
#         for chunk in process_message_with_crew(data):
#             print("sending a chunk ")
#             yield f"data: {chunk}\n\n"
    
#     return Response(
#         stream_with_context(generate()),
#         mimetype='text/event-stream',
#         headers={
#             'Cache-Control': 'no-cache',
#             'Connection': 'keep-alive',
#             'X-Accel-Buffering': 'no'  # Important for streaming
#         }
#     )
