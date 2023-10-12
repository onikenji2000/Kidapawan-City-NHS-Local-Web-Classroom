<?php
session_start();
if(!isset($_SESSION['user_code'])) {
    header('Location: ./login.php');
}

$user_code = $_SESSION['user_code'];
$dbfile = $_SESSION['database_locale'];
$sql = new SQLite3($dbfile);

$command = $_POST['command'];

if($command == 'load_activities') {
    $class_code = $_POST['class_code'];
    $query = 'SELECT class_name FROM class WHERE class_code = :class_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':class_code', $class_code);
    
    $result = $sql_statement->execute();
    $class_row = $result->fetchArray(SQLITE3_ASSOC);
    $class_data = [$class_row['class_name']];
    
    $query = 'SELECT activity_no, content, activity_title FROM activity WHERE class_code = :class_code ORDER BY content';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':class_code', $class_code);
    
    $activity_data = [];
    
    $result = $sql_statement->execute();
    while($activity_rows = $result->fetchArray(SQLITE3_ASSOC)) {
        array_push($activity_data, [$activity_rows['activity_no'], $activity_rows['content'], $activity_rows['activity_title']]);
    }
    echo json_encode([$class_data, $activity_data]);
}
elseif($command == 'current_activity') {
    $score = check_score($sql, $_POST['activity_no'], $user_code);
    $query = 'SELECT activity_topic.activity_no, activity_topic.description, activity_topic.modifier, activity_topic.topic,
                question.question_id, question.question_type, question.question, activity.activity_title, user_question.answer
            FROM activity
            INNER JOIN activity_topic ON activity.activity_no = activity_topic.activity_no
            INNER JOIN question ON activity_topic.topic = question.topic
            LEFT JOIN user_question ON
                user_question.question_id = question.question_id AND
                user_question.activity_no = activity_topic.activity_no AND
                user_question.user_code = :user_code
            WHERE activity.activity_no = :activity_no';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
    $sql_statement->bindParam(':user_code', $user_code);
    
    $result = $sql_statement->execute();
    
    $return_data = [];
    $topic = null;
    $topic_array = null;
    $activity_title = null;
    while($content_row = $result->fetchArray(SQLITE3_ASSOC)) {
        if($topic != $content_row['topic']) {
            if($topic != null) array_push($return_data, $topic_array);
            $activity_no = $content_row['activity_no'];
            $topic = $content_row['topic'];
            $activity_title = $content_row['activity_title'];
            $description = $content_row['description'];
            $modifier = $content_row['modifier'];
            $topic_array = [[$activity_no, $activity_title, $topic, $description, $modifier]];
            if($score['submitted'] == 1) $topic_array['score'] = $score['score'];
        }
        $question_id = $content_row['question_id'];
        $question_type = $content_row['question_type'];
        $question = $content_row['question'];
        $answer = $content_row['answer'];
        array_push($topic_array, [$question_id, $question_type, $question, $answer]);
    }
    array_push($return_data, $topic_array);
    $return_data = check_modifiers($user_code, $_POST['activity_no'], $return_data);
    echo json_encode($return_data);
}
elseif($command == 'reload_question_type') {
    $templates_dir = dir('template/');
    
    $list_of_dir = [];
    while(false !== ($entry = $templates_dir->read())) {
        if($entry != '.' && $entry != '..') {
            array_push($list_of_dir, [$entry, $entry]);
        }
    }
    echo json_encode($list_of_dir);
}
elseif($command == 'save_student_answer') {
    $query = 'SELECT interaction_id, user_code, activity_no, question_id, answer
    FROM user_question WHERE user_code = :user_code AND activity_no = :activity_no AND question_id = :question_id';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':user_code', $user_code);
    $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
    $sql_statement->bindParam(':question_id', $_POST['question_id']);
    
    $result = $sql_statement->execute();
    // $interaction = $result->fetchArray(SQLITE3_ASSOC);
    if($interaction = $result->fetchArray(SQLITE3_ASSOC)) {
        // $interaction = $result->fetchArray(SQLITE3_ASSOC);
        $query = 'UPDATE user_question SET answer = :answer WHERE interaction_id = :interaction_id';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':answer', $_POST['answer']);
        $sql_statement->bindParam(':interaction_id', $interaction['interaction_id']);
        
        $result = $sql_statement->execute();
        if($result) echo 'SUCCESS: answer saved successfully';
        else echo 'FAIL: answer was not saved!';
    }
    else {
        $query = 'INSERT INTO user_question(user_code, activity_no, question_id, answer)
        VALUES(:user_code, :activity_no, :question_id, :answer)';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':user_code', $user_code);
        $sql_statement->bindParam(':activity_no', $_POST['activity_no']);
        $sql_statement->bindParam(':question_id', $_POST['question_id']);
        $sql_statement->bindParam(':answer', $_POST['answer']);
        
        $result = $sql_statement->execute();
        if($result) echo 'SUCCESS: answer saved successfully';
        else echo 'FAIL: answer was not saved!';
    }
}
elseif($command == 'submit_finalize') {
    include 'answer.submitter.php';
    echo check_answers($sql, $_POST['activity_no'], $user_code);
}

function check_score($sql, $activity_no, $user_code) {
    $score = ['submitted'=>0, 'score'=>-1];
    $query = 'SELECT score_counter_id, score, submitted FROM score_counter WHERE activity_no = :activity_no AND user_code = :user_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $activity_no);
    $sql_statement->bindParam(':user_code', $user_code);
    $result = $sql_statement->execute();
    if($score_row = $result->fetchArray(SQLITE3_ASSOC)) {
        $score['submitted'] = $score_row['submitted'];
        $score['score'] = $score_row['score'];
    }
    return $score;
}

function check_modifiers($user_code, $activity_no, $topic_data) {
    $new_data = [];
    $data_dump = get_temp_data($user_code, $activity_no);
    if($data_dump) return $data_dump;
    
    foreach($topic_data as $topic) {
        $modifiers = explode(';', $topic[0][4]);
        $the_topic = [$topic[0]];
        foreach($modifiers as $modifier) {
            $modifier_value = explode('=', $modifier);
            if($modifier_value[0] == 'randomize' && $modifier_value[1] == 'true') {
                $questions = array_splice($topic, 1);
                shuffle($questions);
                $topic = array_merge($the_topic, $questions);
            }
            elseif($modifier_value[0] == 'limit') {
                $question_length = (int)($modifier_value[1]);
                $questions = array_splice($topic, 1, $question_length);
                $topic = array_merge($the_topic, $questions);
            }
        }
        array_push($new_data, $topic);
    }
    save_temp_data($user_code, $activity_no, $new_data);
    return $new_data;
}

function get_temp_data($user_code, $activity_no) {
    $file_location = './db/activity.json/' . $user_code . '-' . $activity_no . '.json';
    if(!file_exists($file_location)) return false;
    $file = fopen($file_location, 'r') or die;
    $file_text = fread($file, filesize($file_location));
    fclose($file);
    return json_decode($file_text);
}

function save_temp_data($user_code, $activity_no, $data) {
    $file_location = './db/activity.json/' . $user_code . '-' . $activity_no . '.json';
    $file = fopen($file_location, 'w') or die;
    $data_text = json_encode($data);
    fwrite($file, $data_text);
    fclose($file);
}
?>