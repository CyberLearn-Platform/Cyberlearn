<?php
$conn = new PDO("sqlite:/tmp/users.db");
$conn->exec("CREATE TABLE IF NOT EXISTS users (id INTEGER, username TEXT)");
$conn->exec("INSERT INTO users VALUES (1,'admin')");

$username = $_GET['user'] ?? '';

$query = "SELECT * FROM users WHERE username = '$username'";
$result = $conn->query($query);

if ($result && $result->fetch()) {
    echo "Welcome admin<br>";
    echo file_get_contents("flag.txt");
} else {
    echo "User not found";
}
