<?php
session_start();
$config = './db/database.conf';
$db_template = './db/class_template.db';

if(isset($_POST['logout'])) {
    if($_POST['logout'] == 'log me out') {
        unset($_SESSION['user_code']);
        unset($_SESSION['user_type']);
        echo 'Goodbye, see you next time!';
    }
}
else {
    if(file_exists($config)) {
        $db_str = file($config);
        $db_file = trim($db_str[0]);
        $_SESSION['database_locale'] = $db_file;
        if(!file_exists($db_file)) {
            copy($db_template, $db_file);
            $sql_new = new SQLite3($db_file);
            $user_code = 'admin_001';
            $first_name = 'administrator';
            $username = 'admin';
            $new_password = password_hash('admin', PASSWORD_BCRYPT);
            $statement = "INSERT INTO user (user_code, first_name, user_type, username, password)" .
                         " VALUES (:user_code, :first_name, :user_type, :username, :password)";
            $sql_statement = $sql_new->prepare($statement);
            $sql_statement->bindParam(':user_code', $user_code);
            $sql_statement->bindParam(':first_name', $first_name);
            $sql_statement->bindParam(':user_type', $first_name);
            $sql_statement->bindParam(':username', $username);
            $sql_statement->bindParam(':password', $new_password);
            $sql_statement->execute();
            
        }
        $sql = new SQLite3($db_file);
        
        if(isset($_POST['username']) && isset($_POST['password'])) {
            $username = $_POST['username'];
            $password = $_POST['password']; //password_hash($_POST['password'], PASSWORD_BCRYPT);
            $sql_statement = $sql->prepare("SELECT * FROM user WHERE username = :username");
            $sql_statement->bindParam(':username', $username);
            $result = $sql_statement->execute();
            
            $user_row = $result->fetchArray(SQLITE3_ASSOC);
            if($user_row && password_verify($password, $user_row['password'])) {
                $_SESSION['user_type'] = $user_row['user_type'];
                $_SESSION['user_code'] = $user_row['user_code'];
                header('Location: ./');
            }
        }
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="MOOC specifically used for KCNHS-SHS TVL-ICT">
        <meta name="author" content="CHARLES LOUIE M. SIPLAO">
        
        <title>ICT CLASSROOM</title>
        
        <link href="styles/main.css" rel="stylesheet">
        <link href="styles/designer.css" rel="stylesheet">
        <link href="styles/dialog.css" rel="stylesheet">
        <link href="styles/loading.css" rel="stylesheet">
    </head>
    <body>
        <div class="header">
            <h2>WELCOME to your virtual classroom. Login first to open</h2>
            <div class="width-spacer"></div>
            <div>
                <button class="btn margined-vertical" onclick="sign_in()">Sign In</button>
            </div>
        </div>
        <div class="dialog-wrapper dialog-visible" id="account_dialog">
            <div class="account-dialog" id="account_dialog_inside">
                <form action="login.php" method="post">
                    <div class="dialog-header">
                        <h3>Sign-in</h3>
                    </div>
                    <div class="dialog-content">
                        <label>
                            Username
                            <input type="text" class="textbox" placeholder="Username" id="username_text" name="username" autocomplete="off">
                        </label>
                        <br>
                        <br>
                        <label>
                            Password
                            <input type="password" class="textbox" placeholder="Password" id="password_text" name="password">
                        </label>
                        <hr>
                        <div>
                            <!--<a href="#forgotpass">Forgot Password</a>-->
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <input type="submit" value="Sign-in" class="button">
                    </div>
                </form>
            </div>
        </div>
        <script>
            function sign_in() {
                let sign_in_dialog = document.getElementById('account_dialog');
                sign_in_dialog.className = sign_in_dialog.className.replace('hidden', 'visible');
            }
        </script>
    </body>
</html>

<?php
    }
    else {
        echo 'Error! Configuration File not found';
    }
}
?>