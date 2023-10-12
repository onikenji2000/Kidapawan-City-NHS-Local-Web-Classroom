<?php
session_start();
if(!isset($_SESSION['user_code'])) {
    header('Location: ./login.php');
}

$user_code = $_SESSION['user_code'];
$dbfile = $_SESSION['database_locale'];
$sql = new SQLite3($dbfile);
$update_type = $_POST['update_type'];

if($update_type == 'user_profile') {
    $query = 'UPDATE user
              SET first_name = :first_name, middle_name = :middle_name, last_name = :last_name, sex = :sex, birth_date = :birth_date
              WHERE user_code = :user_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':first_name', $_POST['first_name']);
    $sql_statement->bindParam(':middle_name', $_POST['middle_name']);
    $sql_statement->bindParam(':last_name', $_POST['last_name']);
    $sql_statement->bindParam(':sex', $_POST['sex']);
    $sql_statement->bindParam(':birth_date', $_POST['birth_date']);
    $sql_statement->bindParam(':user_code', $user_code);

    $result = $sql_statement->execute();
    if($result) {
        echo 'Account Profile Update Successful!';
    }
}
elseif($update_type == 'user_account') {
    $query = 'SELECT username FROM user WHERE user_code != :user_code AND username = :username';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':username', $_POST['username']);
    $sql_statement->bindParam(':user_code', $user_code);
    $result = $sql_statement->execute();
    $array = $result->fetchArray();
    
    if($array) {
        echo 'Err: The username you entered is already taken!';
    }
    elseif(strlen($_POST['password']) < 8) {
        echo 'Err: The password you entered is too short!';
    }
    else {
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $query = 'UPDATE user
                 SET username = :username, password = :password
                 WHERE user_code = :user_code';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':username', $_POST['username']);
        $sql_statement->bindParam(':password', $password);
        $sql_statement->bindParam(':user_code', $user_code);
        
        $result = $sql_statement->execute();
        if($result) {
           echo 'Account Security Update Successful!';
        }
    }
    
}

?>