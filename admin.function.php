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

$command = $_POST['command'];

if($command == 'reset_password') {
    $list_user_code = $_POST['user_code'];
    $query = 'SELECT first_name, last_name, user_type FROM user WHERE user_code = :user_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':user_code', $list_user_code);
    
    $result = $sql_statement->execute();
    $user_row = $result->fetchArray(SQLITE3_ASSOC);
    if($user_row) {
        $new_last_name = strtolower(str_replace(' ', '.', $user_row['last_name']));
        $new_username = explode('_', $list_user_code)[1] . '_' . $new_last_name;
        $new_password = $new_username . '_' . $user_row['user_type'];
        $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
        
        $query = 'UPDATE user SET username = :username, password = :password WHERE user_code = :user_code';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':username', $new_username);
        $sql_statement->bindParam(':password', $new_hash);
        $sql_statement->bindParam(':user_code', $list_user_code);
        
        $result = $sql_statement->execute();
        if($result) {
            echo "You have successfully reset the username and password of " . $user_row['first_name'] . ".\n";
            echo "Here are his new Username and Password:\nUsername: \"" . $new_username . "\"\n";
            echo 'Password: "' . $new_password . '"';
        }
    }
}
elseif($command == 'new_class') {
    $class_name = $_POST['class_name'];
    $class_code = $_POST['class_code'];
    $query = 'INSERT INTO class(class_code, author_user_code, class_name) VALUES(:class_code, :author_user_code, :class_name)';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':class_code', $class_code);
    $sql_statement->bindParam(':class_name', $class_name);
    $sql_statement->bindParam(':author_user_code', $user_code);
    
    $result = $sql_statement->execute();
    if($result) {
        echo 'You have successfully added a new class' . "\n" . 'Name of Class: ' . $class_name;
    }
    else {
        echo "Something went wrong. The class is not added\nCheck if you entered a unique Class Code.";
    }
}
elseif($command == 'load_classes') {
    $query = 'SELECT class_code, class_name FROM class WHERE author_user_code = :author_user_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':author_user_code', $user_code);
    
    $result = $sql_statement->execute();
    while($class_row = $result->fetchArray(SQLITE3_ASSOC)) {
        $class_code = $class_row['class_code'];
        echo '<div class="class-block" id="' . $class_code . '"><div class="class-flex">';
        echo '<div><h4>' . $class_row['class_name'] . '</h4></div>';
        echo '<button class="button button-glass" onclick="open_display(\'class_setting' .
             $class_code . '\')">&#9881</button>
            <button class="button button-glass" onclick="open_display(\'class_activity_setting' .
            $class_code . '\')">&#128366</button>';
        echo '</div></div>';
    }
}
elseif($command == 'load_class_settings') {
    $query = 'SELECT * FROM class WHERE class_code = :class_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam('class_code', $_POST['class_code']);
    
    $result = $sql_statement->execute();
    $class_row = $result->fetchArray(SQLITE3_ASSOC);
    if($class_row) {
        echo $class_row['class_code'];
        echo "\n";
        echo $class_row['class_name'];
    }
    else echo 'FAIL';
}
elseif($command == 'load_users') {
    if(isset($_POST['search_text'])) {
        $search_text = '%' . $_POST['search_text'] . '%';
        $query = 'SELECT user.user_code, user.first_name || " " || user.last_name AS full_name, class_user1.class_user_id
                  FROM user LEFT JOIN
                  (
                      SELECT * FROM class_user WHERE class_code = :class_code
                  ) class_user1 ON class_user1.user_code = user.user_code
                  WHERE user.user_type = "student" AND user.' . $_POST['search_category'] . ' LIKE :search_text
                  ORDER BY user.last_name';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':class_code', $_POST['class_code']);
        $sql_statement->bindParam(':search_text', $search_text);
    }
    else {
        $query = 'SELECT user.user_code, user.first_name || " " || user.last_name AS full_name, class_user1.class_user_id
                  FROM user LEFT JOIN
                  (
                      SELECT * FROM class_user WHERE class_code = :class_code
                  ) class_user1 ON class_user1.user_code = user.user_code
                  WHERE user.user_type = "student"
                  ORDER BY user.last_name';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':class_code', $_POST['class_code']);
    }
    
    $result = $sql_statement->execute();
    while($user_row = $result->fetchArray(SQLITE3_ASSOC)) {
        $ths_user = $user_row['user_code'];
        echo '<li class="selectable-li"><label class="checkbox fixed-width-checkbox">';
        echo '<input type="checkbox" id="' . $ths_user;
        echo '_checkbox" onchange="toggle_student_class(' . "'" . $ths_user . "')" . '"';
        if($user_row['class_user_id']) echo 'checked="checked"';
        echo '><span class="checkmark">' . $user_row['full_name'];
        echo '</span></label></li>';
        echo "\n";
    }
}
elseif($command == 'toggle_user_class') {
    $query = 'SELECT * FROM class_user WHERE user_code = :user_code AND class_code = :class_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':user_code', $_POST['user_code']);
    $sql_statement->bindParam(':class_code', $_POST['class_code']);
    
    $result = $sql_statement->execute();
    $user_row = $result->fetchArray(SQLITE3_ASSOC);
    if($user_row) {
        $query = 'DELETE FROM class_user WHERE class_user_id = :class_user_id';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':class_user_id', $user_row['class_user_id']);
        
        $result = $sql_statement->execute();
        if($result) echo 'SUCCESS';
        else 'FAIL';
    }
    else {
        $h_user_code = $_POST['user_code'];
        $h_class_code = $_POST['class_code'];
        $class_user_id = $h_class_code . '_' . $h_user_code;
        $query = 'INSERT INTO class_user(class_user_id, user_code, class_code) VALUES(:class_user_id, :user_code, :class_code)';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':class_user_id', $class_user_id);
        $sql_statement->bindParam(':user_code', $h_user_code);
        $sql_statement->bindParam(':class_code', $h_class_code);
        
        $result = $sql_statement->execute();
        if($result) echo 'SUCCESS';
        else 'FAIL';
    }
}
elseif($command == 'update_class') {
    $query = 'UPDATE class SET class_name = :class_name WHERE class_code = :original_class_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':class_name', $_POST['class_name']);
    $sql_statement->bindParam(':original_class_code', $_POST['class_code']);
    
    $result = $sql_statement->execute();
    $user_row = $result->fetchArray(SQLITE3_ASSOC);
    if($user_row) echo 'Class settings was successfully updated!';
    else echo 'Failed to update class settings';
}
elseif($command == 'insert_activity') {
    $activity_no = $_POST['activity_id'];
    $query = 'SELECT * FROM activity WHERE activity_no = :activity_no';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $activity_no);
    
    $result = $sql_statement->execute();
    $activity_row = $result->fetchArray(SQLITE3_ASSOC);
    if($activity_row) {
        $query = 'UPDATE activity SET content = :content, activity_title = :activity_title
                  WHERE activity_no = :activity_no';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':activity_no', $activity_no);
        $sql_statement->bindParam(':class_code', $_POST['class_code']);
        $sql_statement->bindParam(':content', $_POST['content']);
        $sql_statement->bindParam(':activity_title', $_POST['activity_title']);
        
        $result = $sql_statement->execute();
    }
    else {
        $current_date = date('Y-m-d');
        $query = 'INSERT INTO activity(date_created, class_code, content, activity_title)
                  VALUES(:date_create, :class_code, :content, :activity_title)';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':date_create', $current_date);
        $sql_statement->bindParam(':class_code', $_POST['class_code']);
        $sql_statement->bindParam(':content', $_POST['content']);
        $sql_statement->bindParam(':activity_title', $_POST['activity_title']);
        
        $result = $sql_statement->execute();
        if($result) {
            $query = 'SELECT activity_no FROM activity 
                      WHERE date_created = :date_create AND class_code = :class_code AND 
                      content = :content AND activity_title = :activity_title';
            $sql_statement = $sql->prepare($query);
            $sql_statement->bindParam(':date_create', $current_date);
            $sql_statement->bindParam(':class_code', $_POST['class_code']);
            $sql_statement->bindParam(':content', $_POST['content']);
            $sql_statement->bindParam(':activity_title', $_POST['activity_title']);
            
            $result = $sql_statement->execute();
            $current_activity = $result->fetchArray(SQLITE3_ASSOC);
            echo $current_activity['activity_no'];
        }
    }
}
elseif($command == 'load_activities') {
    $query = 'SELECT activity_no, content, activity_title FROM activity WHERE class_code = :class_code ORDER BY content';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':class_code', $_POST['class_code']);
    
    $activity_data = [];
    
    $result = $sql_statement->execute();
    while($activity_rows = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($activity_data, [$activity_rows['activity_no'], $activity_rows['content'], $activity_rows['activity_title']]);
    }
    echo json_encode($activity_data);
}
elseif($command == 'save_question') {
    $message = '';
    $question_id = $_POST['question_id'];
    if($question_id == '-') {
        $query = 'INSERT INTO question (topic, question_type, question, answer_key)
                  VALUES(:topic, :question_type, :question, :answer_key)';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':topic', $_POST['topic']);
        $sql_statement->bindParam(':question_type', $_POST['question_type']);
        $sql_statement->bindParam(':question', $_POST['question']);
        $sql_statement->bindParam(':answer_key', $_POST['answer_key']);
        
        $result = $sql_statement->execute();
        if($result) $message = 'SUCCESS: The Question was saved successfully';
        else $message = 'FAILED: Failed to save the question.';
    }
    else {
        $query = 'UPDATE question SET question_type = :question_type, question = :question, answer_key = :answer_key
                  WHERE question_id = :question_id';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':question_type', $_POST['question_type']);
        $sql_statement->bindParam(':question', $_POST['question']);
        $sql_statement->bindParam(':answer_key', $_POST['answer_key']);
        $sql_statement->bindParam(':question_id', $_POST['question_id']);
        
        $result = $sql_statement->execute();
        if($result) $message = 'SUCCESS: The Question was saved successfully';
        else $message = 'FAILED: Failed to save the question.';
    }
    if($question_id == '-') {
        $query = 'SELECT * FROM question WHERE question_type = :question_type AND question = :question AND answer_key = :answer_key 
                  ORDER BY question_id DESC';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':topic', $_POST['topic']);
        $sql_statement->bindParam(':question_type', $_POST['question_type']);
        $sql_statement->bindParam(':question', $_POST['question']);
        $sql_statement->bindParam(':answer_key', $_POST['answer_key']);
        
        $result = $sql_statement->execute();
        $question_row = $result->fetchArray(SQLITE3_ASSOC);
        $question_id = $question_row['question_id'];
    }
    echo json_encode([$message, $question_id]);
}
elseif($command == 'load_topics') {
    $query = 'SELECT DISTINCT topic FROM question';
    $sql_statement = $sql->prepare($query);
    $result = $sql_statement->execute();
    $topic_data = [];
    while($question_row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($topic_data, [$question_row['topic']]);
    }
    echo json_encode($topic_data);
}
elseif($command == 'load_questions') {
    $query = 'SELECT question_id, question_type, question, answer_key FROM question WHERE topic = :topic';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':topic', $_POST['topic']);
    
    $question_data = [];
    $result = $sql_statement->execute();
    while($question_row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($question_data, [$question_row['question_id'], $question_row['question_type'],
                                    $question_row['question'], $question_row['answer_key']]);
    }
    echo json_encode($question_data);
}
elseif($command == 'load_activity_topic') {
    $query = 'SELECT activity_topic_id, topic, description, modifier FROM activity_topic WHERE activity_no = :activity_no';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
    $data = [];
    
    $result = $sql_statement->execute();
    while($activity_topic_row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($data, [$activity_topic_row['activity_topic_id'], $activity_topic_row['topic'],
                           $activity_topic_row['description'], $activity_topic_row['modifier']]);
    }
    echo json_encode($data);
}
elseif($command == 'save_activity_topic') {
    $task_data = json_decode($_POST['task_json']);
    $activity_topic_ids = array_column($task_data, 0);
    $current_topic_ids = [];
    $query = 'SELECT activity_topic_id FROM activity_topic WHERE activity_no = :activity_no';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
    
    $result = $sql_statement->execute();
    while($activity_topic_row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($current_topic_ids, $activity_topic_row['activity_topic_id']);
    }
    $remaining_ids = array_diff($current_topic_ids, $activity_topic_ids);
    for($deleter_counter = 0; $deleter_counter < count($remaining_ids); $deleter_counter++) {
        $query = 'DELETE FROM activity_topic WHERE activity_topic_id = :activity_topic_id';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':activity_topic_id', $remaining_ids[$deleter_counter]);
        $result = $sql_statement->execute();
    }
    
    for($task_counter = 0; $task_counter < count($task_data); $task_counter++) {
        if($task_data[$task_counter][0] == null) {
            $query = 'INSERT INTO activity_topic (activity_no, topic, description, modifier) VALUES (:activity_no, :topic, :description, :modifier)';
            $sql_statement = $sql->prepare($query);
            $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
            $sql_statement->bindParam(':topic', $task_data[$task_counter][1]);
            $sql_statement->bindParam(':description', $task_data[$task_counter][2]);
            $sql_statement->bindParam(':modifier', $task_data[$task_counter][3]);
            // echo $_POST['activity_no'] . ', ' . $task_data[$task_counter][1] . ', ' . $task_data[$task_counter][2];
            $result = $sql_statement->execute();
            if($result) {
                $query = 'SELECT activity_topic_id FROM activity_topic ORDER BY activity_topic_id LIMIT 1';
                $sql_statement = $sql->prepare($query);
                $result = $sql_statement->execute();
                $activity_topic_ids[$task_counter] = $result;
            }
        }
        else {
            $query = 'UPDATE activity_topic SET topic = :topic, description = :description, modifier = :modifier WHERE activity_topic_id = :activity_topic_id';
            $sql_statement = $sql->prepare($query);
            $sql_statement->bindParam(':activity_topic_id', $task_data[$task_counter][0]);
            $sql_statement->bindParam(':topic', $task_data[$task_counter][1]);
            $sql_statement->bindParam(':description', $task_data[$task_counter][2]);
            $sql_statement->bindParam(':modifier', $task_data[$task_counter][3]);
            
            $result = $sql_statement->execute();
        }
    }
    echo json_encode($activity_topic_ids);
}
elseif($command == 'custom_query') {
    $json_data = [];
    $query = $_POST['query'];
    $sql_statement = $sql->prepare($query);
    $result = $sql_statement->execute();
    if($query_row = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($json_data, $query_row);
        while($query_row = $result->fetchArray(SQLITE3_ASSOC)) {
            array_push($json_data, $query_row);
        }
    }
    else {
        array_push($json_data, ['Res'=>$result, 'isupdate'=>true]);
    }
    echo json_encode($json_data);
}
?>