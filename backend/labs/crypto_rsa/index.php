<!DOCTYPE html>
<html>
<head>
    <title>RSA Challenge</title>
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
            max-width: 1000px; 
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
        .rsa-data {
            background: #fff3cd;
            border: 3px solid #ffc107;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
        }
        .rsa-data h3 {
            color: #856404;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .rsa-value {
            background: #fff;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
            border: 1px solid #ddd;
        }
        .rsa-label {
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
            display: block;
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
        .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 RSA Challenge</h1>
        <p class="subtitle">Public Key Cryptography - Weak RSA Implementation</p>
        
        <div class="challenge-info">
            <h3>🎯 Challenge Objective</h3>
            <p>An encrypted message was sent using <strong>RSA encryption</strong>, but the implementation is weak! The prime numbers used are too small. Your mission is to factor the modulus <code>n</code> into its prime components, calculate the private key, and decrypt the message to reveal the flag!</p>
        </div>

        <?php
        // Weak RSA parameters (small primes for educational purposes)
        $p = 61;  // First prime
        $q = 53;  // Second prime
        $n = $p * $q;  // Modulus n = p * q = 3233
        $e = 17;  // Public exponent (commonly used small value)
        
        // Calculate phi(n) = (p-1)(q-1)
        $phi = ($p - 1) * ($q - 1);  // phi(n) = 60 * 52 = 3120
        
        // Calculate private exponent d (modular multiplicative inverse of e mod phi)
        // We need: (d * e) mod phi = 1
        // For e=17 and phi=3120, d = 2753
        $d = 2753;
        
        // Message to encrypt: "FLAG" -> convert to numbers
        // F=70, L=76, A=65, G=71 (ASCII values)
        // For simplicity, we encrypt a single number
        $plaintext = 2024;  // Represents our message
        
        // Encrypt: ciphertext = plaintext^e mod n
        $ciphertext = bcpowmod($plaintext, $e, $n);
        ?>

        <div class="rsa-data">
            <h3>📊 RSA Public Key Parameters</h3>
            <div>
                <span class="rsa-label">Public Modulus (n):</span>
                <div class="rsa-value"><?php echo $n; ?></div>
                <p style="color: #856404; font-size: 0.9em; margin-top: 5px;">
                    This is the product of two prime numbers: n = p × q
                </p>
            </div>
            <div style="margin-top: 15px;">
                <span class="rsa-label">Public Exponent (e):</span>
                <div class="rsa-value"><?php echo $e; ?></div>
                <p style="color: #856404; font-size: 0.9em; margin-top: 5px;">
                    Commonly used small prime number
                </p>
            </div>
            <div style="margin-top: 15px;">
                <span class="rsa-label">Encrypted Message (ciphertext):</span>
                <div class="rsa-value"><?php echo $ciphertext; ?></div>
                <p style="color: #856404; font-size: 0.9em; margin-top: 5px;">
                    The encrypted value: c = m<sup>e</sup> mod n
                </p>
            </div>
        </div>

        <div class="warning">
            <strong>⚠️ Vulnerability:</strong> The modulus n = <?php echo $n; ?> is too small! This makes it vulnerable to factorization attacks. In real RSA, n should be at least 2048 bits (over 600 digits).
        </div>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_answer = trim($_POST['answer'] ?? '');
            $correct_flag = "FLAG{rsa_crypto_expert_2024}";
            
            // Check if they submitted the plaintext or the flag
            if (strtoupper($user_answer) === $correct_flag || $user_answer == $plaintext) {
                echo '<div class="success">';
                echo '<h2>✅ RSA Decryption Successful!</h2>';
                echo '<p>Congratulations! You successfully broke the weak RSA encryption!</p>';
                echo '<p><strong>Solution Breakdown:</strong></p>';
                echo '<ul style="margin-left: 20px; line-height: 1.8;">';
                echo '<li>You factored n = ' . $n . ' into p = ' . $p . ' and q = ' . $q . '</li>';
                echo '<li>Calculated φ(n) = (p-1)(q-1) = ' . $phi . '</li>';
                echo '<li>Found private exponent d = ' . $d . '</li>';
                echo '<li>Decrypted: m = c<sup>d</sup> mod n = ' . $plaintext . '</li>';
                echo '</ul>';
                echo '</div>';
                
                echo '<div class="flag">';
                echo '🚩 ' . $correct_flag;
                echo '</div>';
            } else {
                echo '<div class="error">';
                echo '❌ Incorrect answer. Keep trying!';
                echo '<br>Hint: Factor n = ' . $n . ' into two prime numbers';
                echo '</div>';
            }
        }
        ?>

        <div class="decrypt-form">
            <h3>🔓 Submit Your Answer</h3>
            <p style="margin-bottom: 15px; color: #666;">Enter either the decrypted plaintext number OR the final flag</p>
            <form method="POST">
                <input type="text" name="answer" placeholder="Enter decrypted message or FLAG{...}" required>
                <button type="submit">Submit Answer</button>
            </form>
        </div>

        <div class="tool-box">
            <h3>🔢 RSA Decryption Steps</h3>
            <ol style="margin-left: 20px; line-height: 2;">
                <li><strong>Factor n:</strong> Find prime factors p and q where n = p × q</li>
                <li><strong>Calculate φ(n):</strong> φ(n) = (p-1) × (q-1)</li>
                <li><strong>Find d:</strong> Calculate d such that (d × e) mod φ(n) = 1</li>
                <li><strong>Decrypt:</strong> plaintext = ciphertext<sup>d</sup> mod n</li>
            </ol>
        </div>

        <div class="hints">
            <h3>💡 RSA Exploitation Hints</h3>
            <ul>
                <li>📌 <strong>Step 1:</strong> Factor n = <?php echo $n; ?> into two prime numbers</li>
                <li>📌 Since n is small, you can try dividing by primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61...</li>
                <li>📌 <strong>Hint:</strong> Both prime factors are between 50 and 70</li>
                <li>📌 <strong>Online tools:</strong> Search for "RSA calculator" or "prime factorization"</li>
                <li>📌 Once you have p and q, calculate φ(n) = (p-1)(q-1)</li>
                <li>📌 <strong>Find private key d:</strong> Use extended Euclidean algorithm or online RSA calculators</li>
                <li>📌 <strong>Decrypt:</strong> Use the formula m = c<sup>d</sup> mod n</li>
                <li>📌 <strong>Quick solution:</strong> Use an online RSA decoder with n=<?php echo $n; ?>, e=<?php echo $e; ?>, c=<?php echo $ciphertext; ?></li>
            </ul>
        </div>

        <div class="hints" style="background: #fff3cd; border-color: #ffc107;">
            <h3>📚 Learning Objectives</h3>
            <ul>
                <li><strong>Understand RSA:</strong> Asymmetric encryption using public/private key pairs</li>
                <li><strong>Prime Factorization:</strong> Security relies on the difficulty of factoring large numbers</li>
                <li><strong>Weak Implementation:</strong> Small primes make RSA vulnerable to factorization attacks</li>
                <li><strong>Key Size Importance:</strong> Real RSA uses 2048+ bit keys to prevent factorization</li>
                <li><strong>Mathematical Foundation:</strong> Based on modular arithmetic and number theory</li>
            </ul>
        </div>

        <div class="tool-box" style="background: #e7f3ff;">
            <h3>🛠️ Recommended Tools</h3>
            <p><strong>Online Calculators:</strong></p>
            <ul style="margin-left: 20px; line-height: 1.8;">
                <li>Search "RSA Calculator" for online tools</li>
                <li>Prime factorization calculators</li>
                <li>Modular multiplicative inverse calculators</li>
            </ul>
            <p style="margin-top: 15px;"><strong>Python/Sage:</strong></p>
            <pre style="background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; margin-top: 10px;">
from Crypto.Util.number import inverse
n = <?php echo $n; ?>

e = <?php echo $e; ?>

c = <?php echo $ciphertext; ?>

# Factor n (try small primes)
# Once you have p and q:
phi = (p-1)*(q-1)
d = inverse(e, phi)
m = pow(c, d, n)
print(f"Plaintext: {m}")</pre>
        </div>
    </div>
</body>
</html>
