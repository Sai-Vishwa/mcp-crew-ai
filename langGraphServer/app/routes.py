from quart import Blueprint, Response, request, jsonify
import asyncio

# controllers
from .controllers.login.login import login_controller
from .controllers.bot_page.chat_page import chatpage_controller
from .controllers.bot_page.sub_controllers.load_chat_history import load_chat_history_controller
from .controllers.lang_graph.lang_graph import invoke_graph

main = Blueprint("main", __name__)

# GET route
@main.route("/hello", methods=["GET"])
async def hello():
    return jsonify({"message": "Hello vro!"})

# POST route
@main.route("/login", methods=["POST"])
async def login():
    # print("hey i am here")
    data = await request.get_json()
    return await login_controller(data)

@main.route("/chat-page", methods=["POST"])
async def botPage():
    data = await request.get_json()
    return await chatpage_controller(data)

@main.route("/load-chats", methods=["POST"])
async def loadChats():
    data = await request.get_json()
    return await load_chat_history_controller(data)

# SSE route
@main.route("/invoke-graph", methods=["POST"])
async def stream():
    data = await request.get_json()
    return Response(invoke_graph(data), mimetype="text/event-stream")
