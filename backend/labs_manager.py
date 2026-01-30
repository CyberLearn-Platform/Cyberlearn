import subprocess
import uuid
import re

def start_lab(username):
    lab_id = str(uuid.uuid4())[:8]
    container_name = f"lab_{username}_{lab_id}"

    subprocess.run([
        "docker", "run", "-d",
        "--name", container_name,
        "-p", "0:80",
        "cyberforge_lab_web_sqli"
    ], check=True)

    result = subprocess.check_output(
        ["docker", "port", container_name, "80"]
    ).decode()

    # Extract first port number (works on Windows + Linux)
    match = re.search(r":(\d+)", result)
    if not match:
        raise RuntimeError(f"Could not parse port from docker output: {result}")

    port = int(match.group(1))

    return {
        "container": container_name,
        "port": port
    }
