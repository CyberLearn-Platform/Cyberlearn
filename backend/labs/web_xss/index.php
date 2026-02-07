<!DOCTYPE html>
<html>
<head>
    <title>XSS Lab - Comment Board</title>
    <meta charset="UTF-8">
    <?php
    // Set the vulnerable cookie BEFORE any output
    // setcookie parameters: name, value, expire, path, domain, secure, httponly
    setcookie("admin_session", "FLAG{xss_master_2024}", time() + 3600, "/", "", false, false);
    ?>
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
        .admin-cookie {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .admin-cookie strong {
            color: #856404;
            display: block;
            margin-bottom: 10px;
        }
        .admin-cookie code {
            display: block;
            background: #fff;
            padding: 10px;
            border-radius: 5px;
            color: #d63384;
            font-family: 'Courier New', monospace;
            margin-top: 5px;
            word-break: break-all;
        }
        .comment-form {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border: 2px solid #e0e0e0;
        }
        .comment-form h3 { margin-bottom: 15px; color: #333; }
        .comment-form input, .comment-form textarea {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        .comment-form input:focus, .comment-form textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .comment-form button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
        }
        .comment-form button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        .comments-section h3 {
            color: #333;
            margin: 30px 0 15px 0;
            font-size: 1.5em;
        }
        .comment-box {
            background: #f9f9f9;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: #666;
            font-size: 0.9em;
        }
        .comment-author {
            font-weight: bold;
            color: #333;
        }
        .comment-content {
            color: #333;
            line-height: 1.6;
            margin-top: 10px;
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
        .flag-display {
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
            display: none;
        }
        .flag-display.show {
            display: block;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
        }
        .success-msg {
            background: #d4edda;
            border: 2px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            color: #155724;
            display: none;
        }
        .success-msg.show {
            display: block;
        }
        .no-comments {
            text-align: center;
            color: #999;
            padding: 30px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💬 Comment Board System</h1>
        <p class="subtitle">Cross-Site Scripting (XSS) Challenge</p>
        
        <div class="challenge-info">
            <h3>🎯 Challenge Objective</h3>
            <p>This comment board has an <strong>XSS vulnerability</strong>. User input is not properly sanitized! Your mission is to inject JavaScript code to extract the admin's secret cookie containing the flag.</p>
        </div>

        <div class="admin-cookie">
            <strong>🔐 Simulated Admin Cookie (Your Target):</strong>
            <code id="admin-cookie">admin_session=FLAG{xss_master_2024}</code>
            <p style="margin-top: 10px; color: #856404; font-size: 0.9em;">This cookie is set in your browser. Use XSS to steal it!</p>
            <button onclick="alert('Cookie value: ' + document.cookie)" style="margin-top: 10px; padding: 8px 16px; background: #ffc107; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🧪 Test Cookie Access</button>
        </div>

        <div id="success-message" class="success-msg">
            <h3>✅ XSS Exploitation Successful!</h3>
            <p>You have successfully executed JavaScript code in the page context! This demonstrates how XSS can be used to steal cookies, session tokens, and sensitive data.</p>
        </div>

        <div id="flag-display" class="flag-display">
            🚩 FLAG{xss_master_2024}
        </div>

        <div class="comment-form">
            <h3>📝 Post a Comment</h3>
            <form method="POST" onsubmit="return checkSubmit();">
                <input type="text" name="name" id="name-input" placeholder="Your name" required>
                <textarea name="comment" id="comment-input" placeholder="Write your comment here..." rows="4" required></textarea>
                <button type="submit">Post Comment</button>
            </form>
        </div>

        <div class="comments-section">
            <h3>💭 Comments (<?php 
                session_start();
                if (!isset($_SESSION['comments'])) {
                    $_SESSION['comments'] = [];
                }
                echo count($_SESSION['comments']); 
            ?>)</h3>
            
            <?php
            // Cookie already set at the top of the page
            
            // Add new comment (VULNERABLE - no sanitization!)
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $name = $_POST['name'] ?? '';
                $comment = $_POST['comment'] ?? '';
                $_SESSION['comments'][] = [
                    'name' => $name,
                    'comment' => $comment,
                    'time' => date('Y-m-d H:i:s')
                ];
            }
            
            // Display comments (VULNERABLE - direct output!)
            if (!empty($_SESSION['comments'])) {
                foreach ($_SESSION['comments'] as $c) {
                    echo "<div class='comment-box'>";
                    echo "<div class='comment-header'>";
                    echo "<span class='comment-author'>" . htmlspecialchars($c['name']) . "</span>";
                    echo "<span>" . $c['time'] . "</span>";
                    echo "</div>";
                    echo "<div class='comment-content'>";
                    echo $c['comment']; // VULNERABLE: No escaping! XSS here!
                    echo "</div>";
                    echo "</div>";
                }
            } else {
                echo "<div class='no-comments'>No comments yet. Be the first to comment!</div>";
            }
            ?>
        </div>

        <div class="hints">
            <h3>💡 XSS Exploitation Hints</h3>
            <ul>
                <li>📌 The comment field does NOT sanitize HTML/JavaScript</li>
                <li>📌 Try injecting a <code>&lt;script&gt;</code> tag in your comment</li>
                <li>📌 <strong>Basic XSS payload:</strong> <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
                <li>📌 <strong>Cookie stealing payload:</strong> <code>&lt;script&gt;alert(document.cookie)&lt;/script&gt;</code></li>
                <li>📌 <strong>Advanced payload:</strong> <code>&lt;img src=x onerror="alert(document.cookie)"&gt;</code></li>
                <li>📌 <strong>Direct flag reveal:</strong> <code>&lt;script&gt;alert('FLAG{xss_master_2024}');&lt;/script&gt;</code></li>
                <li>📌 When your JavaScript executes, it will show the admin cookie containing the flag!</li>
                <li>📌 <strong>Complete Solution:</strong> Post this as a comment: <code>&lt;script&gt;document.getElementById('flag-display').classList.add('show'); document.getElementById('success-message').classList.add('show'); alert('You exploited XSS! Flag: FLAG{xss_master_2024}');&lt;/script&gt;</code></li>
            </ul>
        </div>

        <div class="hints" style="background: #fff3cd; border-color: #ffc107;">
            <h3>📚 Learning Objectives</h3>
            <ul>
                <li><strong>Understand XSS:</strong> How unsanitized user input can execute malicious scripts</li>
                <li><strong>Cookie Theft:</strong> XSS can steal session cookies and authentication tokens</li>
                <li><strong>Impact:</strong> Account takeover, data theft, malware distribution</li>
                <li><strong>Prevention:</strong> Always escape/sanitize user input, use Content Security Policy (CSP), HttpOnly cookies</li>
            </ul>
        </div>
    </div>

    <script>
        function checkSubmit() {
            // Just for user experience - let the form submit normally
            return true;
        }
    </script>
</body>
</html>
