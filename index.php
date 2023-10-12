<?php
session_start();
if(!isset($_SESSION['user_code'])) {
    header('Location: ./login.php');
}

$user_code = $_SESSION['user_code'];
$dbfile = $_SESSION['database_locale'];
$sql = new SQLite3($dbfile);
$query = 'SELECT user_code, first_name, middle_name, last_name, sex, user_type, birth_date, username FROM user WHERE user_code = :user_code';
$sql_statement = $sql->prepare($query);
$sql_statement->bindParam(':user_code', $user_code);
$user_result = $sql_statement->execute();
$user_row = $user_result->fetchArray(SQLITE3_ASSOC);

$first_name = $user_row['first_name'];
$middle_name = $user_row['middle_name'];
$last_name = $user_row['last_name'];
$sex = $user_row['sex'];
$user_type = $user_row['user_type'];
$birth_date = $user_row['birth_date'];
$username = $user_row['username'];

$query = 'SELECT class.class_code, class.class_name, class_user.user_code
          FROM class INNER JOIN class_user ON class.class_code = class_user.class_code
          WHERE class_user.user_code = :user_code';
$sql_statement = $sql->prepare($query);
$sql_statement->bindParam(':user_code', $user_code);
$class_result = $sql_statement->execute();

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
            <h2>WELCOME <?php echo $first_name; ?> to your virtual classroom.</h2>
            <div class="width-spacer"></div>
            <div>
                <button class="btn margined-vertical" onclick="open_account()">Profile</button>
                <button class="btn margined-vertical" onclick="logout()">Sign Out</button>
            </div>
        </div>
        <div class="rowe">
            <div class="section">
                <ul>
                    <?php
                    if($user_type == 'teacher' || $user_type == 'administrator') {
                        ?>
                    <li onclick="open_display('user_list')">User List</li>
                    <li onclick="open_display('test_bank')">Test Bank</li>
                    <li onclick="open_display('class_list')">Class List</li>
                    <li onclick="open_display('custom_query')">Custom Query</li>
                        <?php
                    }
                    else {
                        while($class_row = $class_result->fetchArray(SQLITE3_ASSOC)) {
                            ?>
                    <li onclick="open_display('class_view<?php echo $class_row['class_code']; ?>');">
                            <?php echo $class_row['class_name']; ?></li>        
                            <?php
                        }
                    ?>
                    
                    <?php
                    }
                    ?>
                </ul>
            </div>
            <div class="contents" id="contents">
                <div class="content content-hidden" id="main_content">
                    <div class="loading" id="loading">
                        <p class="loading-object">⬣</p>
                        <p class="loading-object">⬣</p>
                        <p class="loading-object">⬣</p>
                    </div>
                    <div class="activities activities-hidden" id="activities">
                        
                    </div>
                </div>
            </div>
        </div>
        <div class="dialog-wrapper dialog-hidden" id="account_dialog">
            <div class="account-dialog dialog-pane-visible" id="account_dialog_inside">
                <div class="dialog-header">
                    <h3>Profile</h3>
                </div>
                <div class="dialog-content">
                    <label>Name
                        <input type="text" class="textbox" placeholder="First Name" id="first_name" value="<?php echo $first_name; ?>">
                        <input type="text" class="textbox" placeholder="Middle Name" id="middle_name" value="<?php echo $middle_name; ?>">
                        <input type="text" class="textbox" placeholder="Last Name" id="last_name" value="<?php echo $last_name; ?>">
                    </label>
                    <hr>
                    <div>
                        <label>Sex:
                            <select id="sex_select">
                                <option class="unselectable">select</option>
                                <option value="male" <?php if($sex == 'male') echo 'selected'; ?>>male</option>
                                <option value="female" <?php if($sex == 'female') echo 'selected'; ?>>female</option>
                            </select>
                        </label>
                    </div>
                    <label>User Type
                        <input type="text" class="textbox" placeholder="User Type" id="user_type" value="<?php echo $user_type; ?>" disabled>
                    </label>
                    <div>
                        <label>Birth Date
                            <input type="date" class="textbox" placeholder="Birth Date" id="birth_date" value="<?php echo $birth_date; ?>">
                        </label>
                    </div>
                    <button class="button" onclick="open_security_settings()">Security Settings</button>
                </div>
                <div class="dialog-footer">
                    <button onclick="close_account()">CLOSE</button>
                    <button onclick="update_user_profile()">SAVE</button>
                </div>
            </div>
            <div class="security-dialog dialog-pane-hidden" id="security_dialog_inside">
                <div class="dialog-header">
                    <button class="button" onclick="close_security_settings()"><-Back</button>
                    <h3>Security Settings</h3>
                </div>
                <div class="dialog-content">
                    <div>
                        <label>Username</label>
                        <input type="text" class="textbox" placeholder="Username" id="username" value="<?php echo $username; ?>">
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" class="textbox" placeholder="Password" id="password_1">
                    </div>
                    <div>
                        <label>Retype Password</label>
                        <input type="password" class="textbox" placeholder="Password" id="password_2">
                    </div>
                </div>
                <div class="dialog-footer">
                    <button onclick="close_account()">CLOSE</button>
                    <button onclick="update_user_security()">SAVE</button>
                </div>
            </div>
        </div>
        
    </body>
    <script src="js/loading.js"></script>
    <script src="js/main.js"></script>
    <script src="js/data.functions.js"></script>
    <script src="js/designer.actions.js"></script>
</html>