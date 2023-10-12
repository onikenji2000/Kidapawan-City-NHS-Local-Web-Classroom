function load_question_data(json_data, container_div) {
    let question_content = container_div.getElementsByClassName('question-content')[0];
    let answer_key = container_div.getElementsByClassName('answer-key')[0];
    if(json_data[0] == null) return;
    question_content.value = json_data[0];
    question_content.innerHTML = json_data[2];
    answer_key.value = json_data[3];
}

function save_question(event_handle) {
    let save_button = event_handle.srcElement;
    let question_div = save_button.parentElement;
    let topic_header = question_div.parentElement.getElementsByTagName('h4')[0];
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'save_question');
    data.append('question_id', question_div.value);
    data.append('topic', topic_header.innerHTML);
    data.append('question_type', save_button.value);
    data.append('question', question_div.getElementsByClassName('question-content')[0].innerHTML);
    data.append('answer_key', question_div.getElementsByClassName('answer-key')[0].value);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let response = JSON.parse(http.responseText);
            question_div.value = response[1];
            alert(response[0]);
        }
    };
    http.send(data);
}