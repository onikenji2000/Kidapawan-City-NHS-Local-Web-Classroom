function load_question_data(json_data, container_div) {
    let question_box = container_div.getElementsByClassName('question-content')[0];
    question_box.value = json_data[0];
    question_box.innerHTML = json_data[2];
    if(json_data[3]) {
        let answer_text = container_div.getElementsByClassName('answer-key')[0];
        answer_text.value = json_data[3];
    }
}

function save_question_data(container_div) {
    // console.log(container_div);
    temp = container_div;
    let http = new XMLHttpRequest();
    let data = new FormData();
    let task_panel = document.getElementById('task_panel');
    let activity_no = task_panel.value;
    let question_id = container_div.getElementsByClassName('pane-inside')[0].value;
    let answer = container_div.getElementsByClassName('answer-key')[0].value;
    
    data.append('command', 'save_student_answer');
    data.append('activity_no', activity_no);
    data.append('question_id', question_id);
    data.append('answer', answer);
    
    http.open('POST', 'student.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            if(http.responseText.search('FAIL') >= 0) {
                alert(http.responseText + "\n" + "Kindly refresh the page to avoid glitch on your answers.");
            }
        }
    };
    http.send(data);
}