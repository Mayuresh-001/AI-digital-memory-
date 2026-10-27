import os
import sys
import json
import base64
import urllib.request
import urllib.error

PROJECT_DIR = os.path.abspath(os.path.dirname(__file__))
IGNORE_DIRS = {".git", "__pycache__", "venv", ".venv", "env", ".idea", ".vscode"}
IGNORE_FILES = {".DS_Store", "probe_server.py", "upload_to_github.py"}

def get_files_to_upload():
    file_list = []
    for root, dirs, files in os.walk(PROJECT_DIR):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.endswith(".egg-info")]
        for f in files:
            if f in IGNORE_FILES or f.endswith((".pyc", ".pyo")):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, PROJECT_DIR).replace("\\", "/")
            file_list.append((rel_path, full_path))
    return file_list

def github_api_request(url, method="GET", token=None, data=None):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-AI-Uploader"
    }
    if token:
        headers["Authorization"] = f"token {token}"

    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_body)
        except Exception:
            return e.code, {"message": error_body}

def upload(token: str, repo_name: str = "ai-digital-memory", description: str = "AI Digital Memory for Students - ML-based Revision System"):
    print(f"Connecting to GitHub as Mayuresh-001...")

    # 1. Verify Token
    status, user_info = github_api_request("https://api.github.com/user", token=token)
    if status != 200:
        print(f"Authentication failed: {user_info.get('message', 'Invalid Token')}")
        return False

    username = user_info.get("login")
    print(f"Authenticated as: {username} ({user_info.get('name', '')})")

    # 2. Check if repo exists, create if not
    repo_url = f"https://api.github.com/repos/{username}/{repo_name}"
    status, repo_info = github_api_request(repo_url, token=token)

    if status == 404:
        print(f"Creating repository '{repo_name}' under {username}...")
        create_payload = {
            "name": repo_name,
            "description": description,
            "private": False,
            "auto_init": True
        }
        status, repo_info = github_api_request("https://api.github.com/user/repos", method="POST", token=token, data=create_payload)
        if status not in [200, 201]:
            print(f"Failed to create repository: {repo_info.get('message')}")
            return False
        print(f"Repository created successfully: {repo_info.get('html_url')}")
    elif status == 200:
        print(f"Found existing repository: {repo_info.get('html_url')}")
    else:
        print(f"Error accessing repository: {repo_info.get('message')}")
        return False

    # 3. Upload files via GitHub Contents API
    files = get_files_to_upload()
    print(f"Uploading {len(files)} files to {repo_info.get('html_url')}...")

    for rel_path, full_path in files:
        try:
            with open(full_path, "rb") as fp:
                content_bytes = fp.read()
            content_b64 = base64.b64encode(content_bytes).decode("utf-8")

            # Check if file exists to provide SHA for updating
            content_url = f"https://api.github.com/repos/{username}/{repo_name}/contents/{rel_path}"
            status, existing_file = github_api_request(content_url, token=token)
            
            payload = {
                "message": f"Add {rel_path}",
                "content": content_b64,
                "branch": "main"
            }
            if status == 200 and "sha" in existing_file:
                payload["sha"] = existing_file["sha"]
                payload["message"] = f"Update {rel_path}"

            status, res = github_api_request(content_url, method="PUT", token=token, data=payload)
            if status in [200, 201]:
                print(f"  [OK] Uploaded {rel_path}")
            else:
                print(f"  [!] Failed to upload {rel_path}: {res.get('message')}")
        except Exception as e:
            print(f"  [!] Error reading/uploading {rel_path}: {e}")

    print("\n" + "=" * 60)
    print(f"Repository successfully published at:")
    print(f"  {repo_info.get('html_url')}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        token = sys.argv[1].strip()
        repo = sys.argv[2].strip() if len(sys.argv) > 2 else "ai-digital-memory"
        upload(token, repo)
    else:
        print("Usage: python upload_to_github.py <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN> [REPO_NAME]")
        print("Or run the Git commands directly once Git is installed.")
