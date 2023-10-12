<?php

$templates_dir = dir('template/');

while(false !== ($entry = $templates_dir->read())) {
    if($entry != '.' && $entry != '..') {
        include 'template/' . $entry . '/checker.php';
    }
}

function check_answers($sql, $activity_no, $user_code) {
    $score = 0;
    $query = 'SELECT activity.activity_no, question.question_id, activity_topic.modifier,
			question.question_type, user_question.answer, question.answer_key
            FROM activity
            INNER JOIN activity_topic ON activity.activity_no = activity_topic.activity_no
            INNER JOIN question ON activity_topic.topic = question.topic
            LEFT JOIN user_question ON
                user_question.question_id = question.question_id AND
                user_question.activity_no = activity_topic.activity_no AND
                user_question.user_code = :user_code
            WHERE activity.activity_no = :activity_no';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':user_code', $user_code);
    $sql_statement->bindParam(':activity_no', $activity_no);
    
    $result = $sql_statement->execute();
    while($answer_check_row = $result->fetchArray(SQLITE3_ASSOC)) {
        $func_name = str_replace(".", "_", $answer_check_row['question_type']);
        $modifiers = explode(';', $answer_check_row['modifier']);
        $multiplier = 1;
        foreach($modifiers as $modifier) {
            $handle = explode('=', $modifier);
            if(strcasecmp($handle[0], 'score_multiplier') == 0 || strcasecmp($handle[0], 'multiplier') == 0) {
                $multiplier = int($handle[1]);
                break;
            }
        }
        $score += $func_name($answer_check_row['answer'], $answer_check_row['answer_key']);
    }
    return save_score($sql, $activity_no, $user_code, $score);
}

function save_score($sql, $activity_no, $user_code, $score) {
    $query = 'SELECT score_counter_id, activity_no, user_code, score, submitted FROM score_counter
    WHERE activity_no = :activity_no AND user_code = :user_code';
    $sql_statement = $sql->prepare($query);
    $sql_statement->bindParam(':activity_no', $activity_no);
    $sql_statement->bindParam(':user_code', $user_code);
    
    $result = $sql_statement->execute();
    if($score_row = $result->fetchArray(SQLITE3_ASSOC)) {
        $query = 'UPDATE score_counter SET score = :score WHERE score_counter_id = :score_id';
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':score_id', $score_row['score_counter_id']);
        $sql_statement->bindParam(':score', $score);
        $result = $sql_statement->execute();
        if($result) return $score;
        else return -1;
    }
    else {
        $query = 'INSERT INTO score_counter (activity_no, user_code, score, submitted)
        VALUES (:activity_no, :user_code, :score, :submitted)';
        $submitted = 1;
        $sql_statement = $sql->prepare($query);
        $sql_statement->bindParam(':activity_no', $activity_no);
        $sql_statement->bindParam(':user_code', $user_code);
        $sql_statement->bindParam(':score', $score);
        $sql_statement->bindParam(':submitted', $submitted);
        
        $result = $sql_statement->execute();
        if($result) return $score;
        else return -1;
    }
}

?>