<!DOCTYPE html>
<html>
<head>
    <title>Auth Bypass Lab - Login</title>
    <style>
        body { font-family: Arial; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #333; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; background: #667eea; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #5568d3; }
        .hint { color: #666; font-size: 12px; margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        .error { color: red; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Login System</h1>
        <p style="text-align: center; color: #666;">Authentication Bypass Challenge</p>
        
        <?php
        session_start();
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            
            // Weak authentication check
            if ($username === 'admin' && $password === 'super_secret_password_12345') {
                $_SESSION['user'] = 'admin';
                $_SESSION['is_admin'] = true;
                header('Location: admin.php');
                exit;
            } else {
                echo "<p class='error'>Invalid credentials!</p>";
            }
        }
        ?>
        
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        
        <div class="hint">
            <strong>🎯 Challenge:</strong> Bypass the authentication without knowing the password!<br><br>
            <strong>Hints:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Check the cookies after trying to login</li>
                <li>Try modifying session data</li>
                <li>Look at what determines admin access</li>
                <li>Browser DevTools might be helpful (F12)</li>
            </ul>
        </div>
    </div>
</body>
</html>
