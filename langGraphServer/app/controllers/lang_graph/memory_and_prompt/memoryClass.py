
from typing import Any, Dict, List, Optional 
from pydantic import BaseModel , Field



class Chat :
  chat_id : int
  user_message : str
  ai_message : str

class CustomMemory :
  user_session : str
  user_name : str
  summary : str
  history : List[Chat]
  