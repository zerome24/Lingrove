"""
Vercel Serverless Function entry point for Lingrove FastAPI backend.
Directs /api/* requests to FastAPI app instance.
"""
import sys
import os

# Resolve paths so backend modules can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for path in [ROOT_DIR, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.app.main import app

# Vercel Serverless looks for an ASGI application called 'app'
export = app
