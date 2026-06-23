import os
from dotenv import load_dotenv
from config import Config

load_dotenv()
print(f"DEBUG: DATABASE_URL env = '{os.environ.get('DATABASE_URL')}'")
print(f"DEBUG: Config.SQLALCHEMY_DATABASE_URI = '{Config.SQLALCHEMY_DATABASE_URI}'")
