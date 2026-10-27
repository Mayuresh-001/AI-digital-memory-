import sys
import os
import uvicorn

# Ensure the root project folder is on Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("=" * 70)
    print("  AI Digital Memory for Students - Full-Stack Application")
    print("  Machine Learning Based Personalized Revision System")
    print("=" * 70)
    print("  Local Web App: http://127.0.0.1:8000")
    print("  Interactive API Docs: http://127.0.0.1:8000/docs")
    print("  Demo Student Credentials:")
    print("    Email:    alex.student@example.com")
    print("    Password: password123")
    print("=" * 70)
    
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
