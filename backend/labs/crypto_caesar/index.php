<!DOCTYPE html>
<html>
<head>
    <title>Caesar Cipher Challenge</title>
    <meta charset="UTF-8">
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
        .encrypted-message {
            background: #fff3cd;
            border: 3px solid #ffc107;
            padding: 30px;
            margin: 25px 0;
            border-radius: 10px;
            text-align: center;
        }
        .encrypted-message h3 {
            color: #856404;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .cipher-text {
            font-size: 1.8em;
            font-weight: bold;
            color: #333;
            font-family: 'Courier New', monospace;
            letter-spacing: 3px;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            margin: 15px 0;
            word-wrap: break-word;
        }
        .decrypt-form {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border: 2px solid #e0e0e0;
        }
        .decrypt-form h3 { margin-bottom: 15px; color: #333; }
        .decrypt-form input {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            font-family: 'Courier New', monospace;
        }
        .decrypt-form input:focus {
            outline: none;
            border-color: #667eea;
        }
        .decrypt-form button {
            background: #667eea;
            color: white;
            padding: 15px 35px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
            width: 100%;
        }
        .decrypt-form button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
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
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            color: #721c24;
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
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
        }
        .tool-box {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .tool-box h3 {
            color: #333;
            margin-bottom: 15px;
        }
        .alphabet-grid {
            display: grid;
            grid-template-columns: repeat(13, 1fr);
            gap: 5px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
        }
        .letter-box {
            background: #e9ecef;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Caesar Cipher Challenge</h1>
        <p class="subtitle">Classical Cryptography - Shift Cipher</p>
        
        <div class="challenge-info">
            <h3>🎯 Challenge Objective</h3>
            <p>A secret message has been encrypted using the <strong>Caesar Cipher</strong>, one of the oldest and simplest encryption techniques. Julius Caesar used this cipher to protect military messages. Your mission is to decrypt the message and reveal the hidden flag!</p>
        </div>

        <div class="encrypted-message">
            <h3>📜 Encrypted Message</h3>
            <div class="cipher-text">SYNT{FRNFNE_PELCGB_ZNFGRE}</div>
            <p style="margin-top: 15px; color: #856404;">This message was encrypted using a Caesar Cipher with an unknown shift value (ROT-?)</p>
        </div>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $decrypted = strtoupper(trim($_POST['decrypted'] ?? ''));
            $correct_flag = "FLAG{CAESAR_CRYPTO_MASTER}";
            
            if ($decrypted === $correct_flag) {
                echo '<div class="success">';
                echo '<h2>✅ Decryption Successful!</h2>';
                echo '<p>Congratulations! You successfully decrypted the Caesar Cipher!</p>';
                echo '<p><strong>Explanation:</strong> The message was encrypted using ROT13 (Caesar shift of 13). Each letter was shifted 13 positions in the alphabet.</p>';
                echo '</div>';
                
                echo '<div class="flag">';
                echo '🚩 ' . $correct_flag;
                echo '</div>';
            } else {
                echo '<div class="error">';
                echo '❌ Incorrect decryption. Try again!';
                echo '<br>Hint: Make sure to include FLAG{...} format';
                echo '</div>';
            }
        }
        ?>

        <div class="decrypt-form">
            <h3>🔓 Submit Decrypted Message</h3>
            <form method="POST">
                <input type="text" name="decrypted" placeholder="Enter the decrypted message (FLAG{...})" required>
                <button type="submit">Decrypt & Submit</button>
            </form>
        </div>

        <div class="tool-box">
            <h3>🔤 Caesar Cipher Reference</h3>
            <p><strong>Original Alphabet:</strong></p>
            <div class="alphabet-grid">
                <?php
                $alphabet = str_split('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
                foreach ($alphabet as $letter) {
                    echo "<div class='letter-box'>$letter</div>";
                }
                ?>
            </div>
            <p style="margin-top: 15px;"><strong>ROT13 Shifted (shift by 13):</strong></p>
            <div class="alphabet-grid">
                <?php
                $rot13 = str_split('NOPQRSTUVWXYZABCDEFGHIJKLM');
                foreach ($rot13 as $letter) {
                    echo "<div class='letter-box' style='background: #ffc107; color: #fff;'>$letter</div>";
                }
                ?>
            </div>
        </div>

        <div class="hints">
            <h3>💡 Caesar Cipher Decryption Hints</h3>
            <ul>
                <li>📌 The Caesar Cipher shifts each letter by a fixed number of positions in the alphabet</li>
                <li>📌 There are only 25 possible shifts (ROT1 to ROT25)</li>
                <li>📌 <strong>ROT13</strong> is the most common variant (shift of 13 positions)</li>
                <li>📌 Try shifting each letter back: S→F, Y→L, N→A, T→G...</li>
                <li>📌 <strong>Online tool hint:</strong> Search for "ROT13 decoder" or try all shifts</li>
                <li>📌 The message starts with <code>SYNT</code> which decrypts to <code>FLAG</code></li>
                <li>📌 Look for patterns: English words often contain common letters like E, T, A, O</li>
                <li>📌 <strong>Quick test:</strong> If you see repeated patterns in ciphertext, they're likely repeated words</li>
            </ul>
        </div>

        <div class="hints" style="background: #fff3cd; border-color: #ffc107;">
            <h3>📚 Learning Objectives</h3>
            <ul>
                <li><strong>Understand Caesar Cipher:</strong> One of the simplest substitution ciphers in cryptography</li>
                <li><strong>Brute Force Attack:</strong> With only 25 possible keys, trying all combinations is feasible</li>
                <li><strong>Frequency Analysis:</strong> Letter frequency can help identify the shift value</li>
                <li><strong>Historical Context:</strong> Used by Julius Caesar 2000 years ago, now easily broken</li>
                <li><strong>Modern Relevance:</strong> Demonstrates why simple substitution ciphers are insecure</li>
            </ul>
        </div>

        <div class="tool-box" style="background: #e7f3ff;">
            <h3>🛠️ Decryption Methods</h3>
            <p><strong>Method 1 - Manual Shifting:</strong> Shift each letter back by trying different values (1-25)</p>
            <p><strong>Method 2 - ROT13:</strong> Apply ROT13 (most common) - each letter shifts by 13</p>
            <p><strong>Method 3 - Frequency Analysis:</strong> Identify common English letters to guess the shift</p>
            <p><strong>Method 4 - Online Tools:</strong> Use a Caesar cipher decoder with brute force option</p>
        </div>
    </div>
</body>
</html>
