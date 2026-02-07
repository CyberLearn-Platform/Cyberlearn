<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
    <style>
        body { font-family: Arial; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #333; }
        .flag-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; font-size: 20px; font-weight: bold; color: #155724; }
        .success { color: #28a745; text-align: center; font-size: 18px; }
        .denied { color: red; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Admin Panel</h1>
        
        <?php
        session_start();
        
        // VULNERABLE: Only checks session variable, not proper authentication
        if (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true) {
            echo "<p class='success'>✅ Access Granted! Welcome Admin!</p>";
            echo "<div class='flag-box'>";
            echo "🚩 " . file_get_contents('flag.txt');
            echo "</div>";
            echo "<p style='text-align: center; color: #666;'>Congratulations! You successfully bypassed the authentication!</p>";
        } else {
            echo "<p class='denied'>❌ Access Denied!</p>";
            echo "<p style='text-align: center; color: #666;'>You need to be an admin to view this page.</p>";
            echo "<p style='text-align: center;'><a href='index.php'>Go back to login</a></p>";
        }
        ?>
    </div>
</body>
</html>
