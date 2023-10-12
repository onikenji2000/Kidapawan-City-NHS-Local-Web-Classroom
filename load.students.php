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

$query = 'SELECT user_code, first_name || " " || last_name AS full_name, sex, user_type FROM user';
$sql_statement = $sql->prepare($query);

if(isset($_POST['text_search'])) {
    $text = '%' . $_POST['text_search'] . '%';
    $category = $_POST['column_search'];
    $query = 'SELECT user_code, first_name || " " || last_name AS full_name, sex, user_type
              FROM user
              WHERE ' . $category . ' LIKE :search_text';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':search_text', $text);
}

$result = $sql_statement->execute();

echo '<tr>';
echo '<th>User Code</th>';
echo '<th>Full Name</th>';
echo '<th>Sex</th>';
echo '<th>User Type</th>';
echo '<th>Edit</th>';
echo '</tr>';
while($user_row = $result->fetchArray(SQLITE3_ASSOC)) {
    echo '<tr id="user_' . $user_row['user_code'] . '">';
    
    echo '<td>' . $user_row['user_code'] . '</td>';
    echo '<td>' . $user_row['full_name'] . '</td>';
    echo '<td>' . $user_row['sex'] . '</td>';
    echo '<td>' . $user_row['user_type'] . '</td>';
    echo '<td><button class="button" onclick="open_user_manager(\'' . $user_row['user_code'] .
          '\', \'user_' . $user_row['user_code'] . '\')">&#9998</button></td>';
    
    echo '</tr>';
}
?>