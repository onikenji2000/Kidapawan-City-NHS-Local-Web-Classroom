<?php

function identification_textbox($answer, $answer_key) {
    $score = 0;
    $answer_keys = explode(';', $answer_key);
    foreach($answer_keys as $key) {
        $ints = strcasecmp($answer, $key);
        if($ints == 0) {
            $score = 1;
            break;
        }
    }
    return $score;
}

?>