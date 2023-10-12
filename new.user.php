<?php
session_start();
if(!isset($_SESSION['user_code'])) {
    header('Location: ./login.php');
}
elseif($_SESSION['user_type'] != 'administrator' && $_SESSION['user_type'] == 'teacher') {
    echo 'You are not authorized to this data.';
}

$user_code = $_SESSION['user_code'];
$dbfile = $_SESSION['database_locale'];
$sql = new SQLite3($dbfile);

$first_name = $_POST['first_name'];
$middle_name = $_POST['middle_name'];
$last_name = $_POST['last_name'];
$user_type = $_POST['user_type'];

$query = 'SELECT user_code FROM user WHERE user_type = :user_type ORDER BY user_code DESC LIMIT 1';
$sql_statement = $sql->prepare($query);
$sql_statement->bindParam(':user_type', $user_type);
$result = $sql_statement->execute();

$final_row = $result->fetchArray(SQLITE3_ASSOC);
$last_user_code = $final_row['user_code'];

$code_number = (int)substr($last_user_code, 8, 4);
$code_number++;
$now_last_name = strtolower(str_replace(' ', '.', $last_name));
$new_user_code = 'student_' . str_pad((string)$code_number, 4, "0", STR_PAD_LEFT);
$username = str_pad((string)$code_number, 4, "0", STR_PAD_LEFT) . '_' . $now_last_name;
$password = $username . '_' . $user_type;
$password = password_hash($password, PASSWORD_BCRYPT);

$query = 'INSERT INTO user(user_code, first_name, middle_name, last_name, user_type, username, password)
          VALUES(:user_code, :first_name, :middle_name, :last_name, :user_type, :username, :password)';
$sql_statement = $sql->prepare($query);
$sql_statement->bindParam(':user_code', $new_user_code);
$sql_statement->bindParam(':first_name', $first_name);
$sql_statement->bindParam(':middle_name', $middle_name);
$sql_statement->bindParam(':last_name', $last_name);
$sql_statement->bindParam(':user_type', $user_type);
$sql_statement->bindParam(':username', $username);
$sql_statement->bindParam(':password', $password);
$result = $sql_statement->execute();

if($result) {
    echo $new_user_code;
}
?>