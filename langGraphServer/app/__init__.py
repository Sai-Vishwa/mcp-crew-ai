from quart import Quart
from quart_cors import cors 


import asyncio

# Cancel all pending tasks


def create_app():
    app = Quart(__name__)
    app = cors(app, allow_origin="*")
    
    try: 
    
        for task in asyncio.all_tasks():
            if not task.done():
                task.cancel()
                try:
                    asyncio.get_event_loop().run_until_complete(task)
                except:
                    pass
                
    except Exception as e : 
        
        pass

    # import and register blueprints
    from .routes import main
    app.register_blueprint(main)    

    return app
