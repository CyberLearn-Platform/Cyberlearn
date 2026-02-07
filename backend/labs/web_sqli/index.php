<!DOCTYPE html>
<html>
<head>
    <title>SQL Injection Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 900px; 
            margin: 30px auto; 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 2.2em; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 1.1em; }
        .challenge-info {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 5px;
        }
        .challenge-info h3 { color: #1976D2; margin-bottom: 10px; }
        .search-box {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border: 2px solid #e0e0e0;
        }
        .search-box label { 
            display: block; 
            margin-bottom: 10px; 
            font-weight: 600;
            color: #333;
        }
        .search-box input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        .search-box input:focus {
            outline: none;
            border-color: #667eea;
        }
        .search-box button {
            background: #667eea;
            color: white;
            padding: 15px 35px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
        }
        .search-box button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        .debug {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
        }
        .debug strong {
            color: #856404;
            display: block;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        .debug code {
            display: block;
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            color: #d63384;
            font-size: 14px;
            word-wrap: break-word;
        }
        .success { 
            background: #d4edda;
            border: 3px solid #28a745;
            padding: 25px;
            margin: 25px 0;
            border-radius: 10px;
            color: #155724;
        }
        .success h2 {
            margin-bottom: 15px;
            font-size: 1.8em;
        }
        .error { 
            background: #f8d7da;
            border: 3px solid #dc3545;
            padding: 25px;
            margin: 25px 0;
            border-radius: 10px;
            color: #721c24;
            font-size: 1.2em;
            text-align: center;
        }
        .flag { 
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border: 4px solid #28a745;
            padding: 30px;
            margin: 25px 0;
            border-radius: 12px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #155724;
            font-family: 'Courier New', monospace;
            animation: pulse 2s infinite;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4); }
            50% { transform: scale(1.03); box-shadow: 0 12px 35px rgba(40, 167, 69, 0.6); }
        }
        .hints {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .hints h3 {
            color: #1976D2;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        .hints ul {
            margin-left: 20px;
            color: #333;
        }
        .hints li {
            margin: 12px 0;
            line-height: 1.8;
        }
        .hints code {
            background: #fff;
            padding: 3px 8px;
            border-radius: 4px;
            color: #d63384;
            font-family: 'Courier New', monospace;
            font-weight: 600;
        }
        .info-box {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .explanation {
            background: #fff9e6;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .explanation strong {
            color: #e65100;
            display: block;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 User Search System</h1>
        <p class="subtitle">SQL Injection Challenge - Capture The Flag</p>
        
        <div class="challenge-info">
            <h3>🎯 Challenge Objective</h3>
            <p>This web application searches for users in a database. However, it contains a <strong>SQL Injection vulnerability</strong>. Your mission is to exploit this vulnerability to retrieve the admin's secret flag!</p>
        </div>

        <div class="search-box">
            <form method="GET">
                <label>🔎 Search for user:</label>
                <input type="text" name="user" placeholder="Enter username (e.g., admin, guest, john)..." value="<?php echo isset($_GET['user']) ? htmlspecialchars($_GET['user']) : ''; ?>" autofocus>
                <button type="submit">Search User</button>
            </form>
        </div>
        
        <?php
        // Initialize database
        $conn = new PDO("sqlite:/tmp/users.db");
        $conn->exec("CREATE TABLE IF NOT EXISTS users (id INTEGER, username TEXT)");
        $conn->exec("DELETE FROM users"); // Clear old data
        $conn->exec("INSERT INTO users VALUES (1,'admin')");
        $conn->exec("INSERT INTO users VALUES (2,'guest')");
        $conn->exec("INSERT INTO users VALUES (3,'john')");
        
        if (isset($_GET['user'])) {
            $username = $_GET['user'];
            
            // Display the vulnerable SQL query
            echo "<div class='debug'>";
            echo "<strong>🐛 Debug Mode - SQL Query:</strong>";
            echo "<code>SELECT * FROM users WHERE username = '$username'</code>";
            echo "</div>";
            
            // VULNERABLE CODE - Direct string concatenation!
            $query = "SELECT * FROM users WHERE username = '$username'";
            $result = $conn->query($query);
            
            if ($result && $result->fetch()) {
                echo "<div class='success'>";
                echo "<h2>✅ Authentication Successful!</h2>";
                echo "<p>You have successfully exploited the SQL injection vulnerability!</p>";
                echo "</div>";
                
                echo "<div class='flag'>";
                echo "🚩 " . file_get_contents("flag.txt");
                echo "</div>";
                
                echo "<div class='explanation'>";
                echo "<strong>📖 What Happened?</strong>";
                echo "<p>Your input manipulated the SQL query by closing the string quote and adding additional SQL logic. This made the WHERE clause evaluate to TRUE, bypassing the intended authentication.</p>";
                echo "<p><strong>Example:</strong> If you entered <code>admin' OR '1'='1</code>, the query became:<br>";
                echo "<code style='color: #d63384;'>SELECT * FROM users WHERE username = 'admin' OR '1'='1'</code><br>";
                echo "Since '1'='1' is always TRUE, the query returns all users!</p>";
                echo "</div>";
            } else {
                echo "<div class='error'>";
                echo "❌ User not found in database";
                echo "</div>";
            }
        } else {
            echo "<div class='info-box'>";
            echo "<p>💡 <strong>Start by searching for a legitimate user:</strong></p>";
            echo "<p>Try: <code>admin</code>, <code>guest</code>, or <code>john</code></p>";
            echo "<p>Notice how the system searches in the database. Now think about how you can manipulate the SQL query...</p>";
            echo "</div>";
        }
        ?>

        <div class="hints">
            <h3>💡 SQL Injection Exploitation Hints</h3>
            <ul>
                <li>📌 <strong>Observe the SQL query</strong> displayed in the debug box above</li>
                <li>📌 The user input is directly inserted into the query without sanitization</li>
                <li>📌 Try using a <strong>single quote</strong> (<code>'</code>) to break out of the string context</li>
                <li>📌 Use SQL operators like <code>OR</code> to create conditions that are always true</li>
                <li>📌 <strong>Example payload 1:</strong> <code>admin' OR '1'='1</code></li>
                <li>📌 <strong>Example payload 2:</strong> <code>' OR 1=1--</code> (the <code>--</code> comments out the rest)</li>
                <li>📌 <strong>Example payload 3:</strong> <code>admin' OR 'a'='a</code></li>
                <li>📌 You don't need to know the actual password - exploit the SQL logic!</li>
            </ul>
        </div>

        <div class="hints" style="background: #fff3cd; border-color: #ffc107;">
            <h3>📚 Learning Objectives</h3>
            <ul>
                <li><strong>Understand SQL Injection:</strong> How unsanitized input can manipulate database queries</li>
                <li><strong>SQL Syntax:</strong> Learn about quotes, operators, and comments in SQL</li>
                <li><strong>Security Impact:</strong> SQL injection can lead to data breaches, authentication bypass, and database compromise</li>
                <li><strong>Prevention:</strong> Always use prepared statements/parameterized queries, never concatenate user input directly into SQL</li>
            </ul>
        </div>
    </div>
</body>
</html>
