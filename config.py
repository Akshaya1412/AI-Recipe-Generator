import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_SQLITE = f'sqlite:///{os.path.join(BASE_DIR, "recipe_generator.db")}'


def get_database_uri():
    url = os.environ.get('DATABASE_URL', '').strip()
    # Ignore invalid or Prisma-style file URLs from global env
    if not url or url.startswith('file:'):
        return DEFAULT_SQLITE
    if url.startswith('sqlite'):
        return url
    if 'mysql' in url or 'postgresql' in url:
        return url
    return DEFAULT_SQLITE


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey_change_me')
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt_secret_key_change_me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
