import subprocess
import uuid
import re

# Mapping of lab IDs to Docker images
LAB_IMAGES = {
    "web-sqli": "cyberforge_lab_web-sqli",
    "web-xss": "cyberforge_lab_web-xss",
    "web-auth-bypass": "cyberforge_lab_web-auth-bypass",
    "crypto-caesar": "cyberforge_lab_crypto-caesar",
    "crypto-rsa": "cyberforge_lab_crypto-rsa",
}

# Store active labs
active_labs = {}

def start_lab(username, lab_id="web-sqli"):
    """Start a Docker container for a specific lab"""
    
    # Check if lab image exists
    if lab_id not in LAB_IMAGES:
        raise ValueError(f"Lab {lab_id} not found. Available labs: {list(LAB_IMAGES.keys())}")
    
    image_name = LAB_IMAGES[lab_id]
    container_id = str(uuid.uuid4())[:8]
    container_name = f"lab_{username}_{lab_id}_{container_id}"

    try:
        # Run Docker container
        subprocess.run([
            "docker", "run", "-d",
            "--name", container_name,
            "-p", "0:80",
            image_name
        ], check=True, capture_output=True, text=True)

        # Get the mapped port
        result = subprocess.check_output(
            ["docker", "port", container_name, "80"]
        ).decode()

        # Extract port number (works on Windows + Linux)
        match = re.search(r":(\d+)", result)
        if not match:
            raise RuntimeError(f"Could not parse port from docker output: {result}")

        port = int(match.group(1))
        
        # Store active lab info
        active_labs[container_name] = {
            "username": username,
            "lab_id": lab_id,
            "port": port,
            "container_name": container_name
        }

        return {
            "success": True,
            "container": container_name,
            "port": port,
            "target": "localhost",
            "lab_id": lab_id
        }
    
    except subprocess.CalledProcessError as e:
        return {
            "success": False,
            "error": f"Failed to start lab: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def stop_lab(container_name):
    """Stop and remove a Docker container"""
    try:
        # Stop the container
        subprocess.run([
            "docker", "stop", container_name
        ], check=True, capture_output=True)
        
        # Remove the container
        subprocess.run([
            "docker", "rm", container_name
        ], check=True, capture_output=True)
        
        # Remove from active labs
        if container_name in active_labs:
            del active_labs[container_name]
        
        return {"success": True, "message": f"Lab {container_name} stopped"}
    
    except subprocess.CalledProcessError as e:
        return {"success": False, "error": f"Failed to stop lab: {str(e)}"}

def get_active_labs():
    """Get list of all active labs"""
    return active_labs

def cleanup_user_labs(username):
    """Stop all labs for a specific user"""
    user_labs = [name for name, info in active_labs.items() if info["username"] == username]
    results = []
    
    for container_name in user_labs:
        result = stop_lab(container_name)
        results.append(result)
    
    return results
