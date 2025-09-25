from quart import Quart
from quart_cors import cors 

def create_app():
    app = Quart(__name__)
    app = cors(app, allow_origin="*")

    # import and register blueprints
    from .routes import main
    app.register_blueprint(main)    

    return app
