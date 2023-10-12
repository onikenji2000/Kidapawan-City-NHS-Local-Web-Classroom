let main_content = document.getElementById('main_content');
let loading = document.getElementById('loading');
let activities = document.getElementById('activities');
let account_dialog = document.getElementById('account_dialog');
let account_dialog_inside = document.getElementById('account_dialog_inside');
let security_dialog_inside = document.getElementById('security_dialog_inside');

function open_display(component_string) {
    let page = '';
    if(component_string == 'user_list') page = 'student.list.html';
    else if(component_string == 'test_bank') page = 'test.bank.html';
    else if(component_string == 'class_list') page = 'class.list.html';
    else if(component_string.search('class_setting') == 0) {
        page = 'class.setting.html';
        current_class_code = component_string.substring('class_setting'.length);
    }
    else if(component_string.search('class_view') == 0) {
        page = 'class.view.html';
        current_class_code = component_string.substring('class_view'.length);
    }
    else if(component_string.search('class_activity_setting') == 0) {
        page = 'teacher.class.activity.html';
        current_class_code = component_string.substring('class_activity_setting'.length);
    }
    else if(component_string.search('open_current_activity') == 0) {
        page = 'activity.show.html';
        current_activity_no = component_string.substring('open_current_activity'.length);
    }
    else if(component_string == 'custom_query') page = 'custom.query.html';
    
    main_content.className = 'content content-visible';
    show_loading_hud(loading);
    open_content_page(page);
    window.location.href = '#contents';
}

function hide_loaded() {
    hide_loading_hud(loading);
    activities.className = 'activities activities-visible';
}

function open_account() {
    account_dialog.className = 'dialog-wrapper dialog-visible';
    account_dialog_inside.className = 'account-dialog account-dialog-visible';
    security_dialog_inside.className = 'security-dialog dialog-pane-hidden';
}

function close_account() {
    account_dialog.className = 'dialog-wrapper dialog-hidden';
}

function open_security_settings() {
    account_dialog_inside.className = 'account-dialog dialog-pane-hidden';
    security_dialog_inside.className = 'security-dialog dialog-pane-visible';
}

function close_security_settings() {
    account_dialog_inside.className = 'account-dialog dialog-pane-visible';
    security_dialog_inside.className = 'security-dialog dialog-pane-hidden';
}

function toggle_visibility(element_id) {
    let doc_element = document.getElementById(element_id);
    let class_names = doc_element.className;
    if(class_names.search('hidden') >= 0) class_names = class_names.replace('hidden', 'visible');
    else class_names = class_names.replace('visible', 'hidden');
    doc_element.className = class_names;
}

function open_user_manager(user_code, row_location) {
    let reset_password_button = document.getElementById('reset_password_user_button');
    let new_user_dialog = document.getElementById('update_user_pane');
    let row = document.getElementById(row_location);
    let full_name_textbox = document.getElementById('update_full_name_textbox');
    let user_type_select = document.getElementById('update_user_type_select');
    
    let position = row.getBoundingClientRect();
    let scroll_modifier = window.pageYOffset;
    let dialog_style = document.styleSheets[2].rules[11];
    let new_top_value = position.top + scroll_modifier - 120;
    let full_name = row.childNodes[1].innerHTML;
    let user_type = row.childNodes[3].innerHTML;
    
    reset_password_button.removeEventListener('click', reset_password);
    reset_password_button.addEventListener('click', reset_password);
    current_user_code_from_list = row.childNodes[0].innerHTML;
    
    if(user_type == 'student') user_type_select.selectedIndex = 0;
    else if(user_type == 'teacher') user_type_select.selectedIndex = 1;
    else if(user_type == 'administrator') user_type_select.selectedIndex = 2;
    full_name_textbox.value = full_name;
    dialog_style.style.top = new_top_value + 'px';
    new_user_dialog.className = new_user_dialog.className.replace('hidden', 'visible');
}

function close_user_manager() {
    let new_user_dialog = document.getElementById('update_user_pane');
    new_user_dialog.className = new_user_dialog.className.replace('visible', 'hidden');
}

function open_new_class() {
    let background = document.getElementById('new_class_background');
    let dialog = document.getElementById('new_class_dialog');
    let dialog_style = document.styleSheets[2].rules[11];
    
    dialog_style.style.top = '50%';
    dialog_style.style.left = '50%';
    dialog_style.style.transform = 'translate(-50%, -50%)';
    background.className = background.className.replace('hidden', 'visible');
    dialog.className = dialog.className.replace('hidden', 'visible');
}

function open_activity_dialog(event_handle) {
    let background = document.getElementById('new_class_background');
    let dialog = document.getElementById('new_class_dialog');
    let dialog_style = document.styleSheets[2].rules[11];
    let settings_button = event_handle.srcElement;
    let task_selector = document.getElementById('task_selector_div').getElementsByClassName('task-selector')[0];
    let dialog_content = dialog.getElementsByClassName('dialog-content')[0];
    let label_text = settings_button.parentElement.getElementsByClassName('editable-element')[0];
    let activity_no = label_text.value;
    let save_button = document.getElementById('save_tasks');
    
    available_tasks(dialog_content, task_selector, activity_no);
    add_listener(save_button, 'click', save_tasks);
    
    dialog_style.style.top = '50%';
    dialog_style.style.left = '50%';
    dialog_style.style.transform = 'translate(-50%, -50%)';
    background.className = background.className.replace('hidden', 'visible');
    dialog.className = dialog.className.replace('hidden', 'visible');
}

function close_new_class() {
    let background = document.getElementById('new_class_background');
    let dialog = document.getElementById('new_class_dialog');
    let dialog_style = document.styleSheets[2].rules[11];
    let dialog_header = dialog.getElementsByClassName('dialog-header')[0].children[0];
    let dialog_content = dialog.getElementsByClassName('dialog-content')[0];
    dialog_style.style.transform = '';
    background.className = background.className.replace('visible', 'hidden');
    dialog.className = dialog.className.replace('visible', 'hidden');
    if(dialog_header.innerHTML == 'Activity Tasks') {
        let dialog_children = dialog_content.getElementsByClassName('question-container');
        for(let counter = dialog_children.length - 1; counter >= 0; counter--) {
            dialog_children[counter].remove();
        }
    }
}

function insert_topic(event_handle) {
    let source_element = event_handle.srcElement;
    let ul_element = source_element.parentElement.parentElement;
    let new_li = document.createElement('li');
    let bold_text = document.createElement('b');
    let new_ul = document.createElement('ul');
    let inner_li = document.createElement('li');
    let new_button = document.createElement('button');
    
    new_ul.insertBefore(inner_li, null);
    inner_li.insertBefore(new_button, null);
    new_button.className = 'button-activity-editor';
    new_button.innerHTML = '(+) Activity';
    add_listener(new_button, 'click', add_new_activity);
    
    new_li.insertBefore(new_ul, null);
    new_li.insertBefore(bold_text, new_ul);
    bold_text.className = 'editable-element';
    bold_text.contentEditable = true;
    ul_element.insertBefore(new_li, source_element.parentElement);
    bold_text.focus();
    add_listener(bold_text, 'focusout', topic_focus_out);
}

function topic_focus_out(event_handle) {
    let source_element = event_handle.srcElement;
    let parent_li = source_element.parentElement;
    let parent_ul = parent_li.parentElement;
    
    if(source_element.tagName == 'B' && source_element.innerHTML.length <= 0 && parent_li.children[1].childElementCount <= 1) {
        parent_ul.removeChild(parent_li);
    }
    else if(source_element.tagName == 'LABEL' && source_element.innerHTML.length <= 0) {
        parent_ul.removeChild(parent_li);
    }
    else if(source_element.tagName == 'LABEL') {
        source_element.className = 'loading-editable-element';
        source_element.contentEditable = false;
        save_new_activity(source_element);
    }
}

function add_new_activity(event_handle) {
    let source_element = event_handle.srcElement;
    let ul_element = source_element.parentElement.parentElement;
    let new_li = document.createElement('li');
    let label_text = document.createElement('label');
    let new_button = document.createElement('button');
    
    ul_element.insertBefore(new_li, source_element.parentElement);
    new_li.insertBefore(new_button, null);
    new_li.insertBefore(label_text, new_button);
    label_text.className = 'activity-link editable-element';
    label_text.contentEditable = true;
    label_text.value = '-';
    label_text.focus();
    add_listener(label_text, 'focusout', topic_focus_out);
    new_button.className = 'button-activity-editor';
    new_button.innerHTML = '&#9998';
    add_listener(button_update, 'click', open_activity_dialog);
}

function set_add_topic_button() {
    let add_topic_button = document.getElementById('add_new_topic_button');
    add_listener(add_topic_button, 'click', add_new_topic);
}

function set_add_question_button(event_handle) {
    // console.log(event_handle.srcElement);
    let add_new_question_button = event_handle.srcElement;
    let div_topic = add_new_question_button.parentElement;
    let question_type_select = document.createElement('select');
    let blank_option = document.createElement('option');
    blank_option.className = 'unselectable';
    blank_option.innerHTML = 'SELECT THE TYPE OF QUESTION';
    question_type_select.insertBefore(blank_option, null);
    question_type_select.className = 'textbox textbox-hidable textbox-hidden';
    
    for(list_counter = 0; list_counter < list_question_type.length; list_counter++) {
        let option_selector = document.createElement('option');
        option_selector.value = list_question_type[list_counter][0];
        option_selector.innerHTML = list_question_type[list_counter][1];
        question_type_select.insertBefore(option_selector, null);
    }
    div_topic.insertBefore(question_type_select, add_new_question_button);
    question_type_select.className = 'textbox textbox-hidable textbox-visible';
    add_listener(question_type_select, 'change', select_type_question);
}

function add_new_topic(event_handle) {
    let test_bank = document.getElementById('test_bank');
    let add_new_topic_box = document.getElementById('add_new_topic_box');
    let add_new_question_button = null;
    let div_topic = document.createElement('div');
    let html_test_topic = '<h4 class="topic-header" contenteditable="true"></h4>' +
                          '<button class="button-test-bank">ADD NEW QUESTION</button>';
    
    div_topic.className = 'topic-box topic-box-hidden';
    test_bank.insertBefore(div_topic, add_new_topic_box);
    setTimeout(function() {
        div_topic.innerHTML = html_test_topic;
        div_topic.className = 'topic-box topic-box-visible';
        add_new_question_button = div_topic.getElementsByClassName('button-test-bank')[0];
        add_listener(add_new_question_button, 'click', set_add_question_button);
    }, 10);
}

function create_blank_task(dialog_content, task_selector, selected_topic) {
    let task_div = document.createElement('div');
    let task_header_selector = document.createElement('select');
    let modifier_textbox = document.createElement('input');
    let description_div = document.createElement('div');
    let remove_button = document.createElement('button');
    
    remove_button.className = 'button-activity-editor';
    remove_button.innerHTML = 'x';
    remove_button.style = 'float: right; background-color: #ff0e00a1';
    add_listener(remove_button, 'click', function() {
        remove_button.parentElement.remove();
    });
    
    modifier_textbox.className = 'textbox modifier-textbox';
    modifier_textbox.style = 'color: #c7e5f6; background-color: #0064c4; outline: none; border: none; border-radius: 4px; font-size: 7px; width: 90%;';
    
    description_div.className = 'question-box question-content';
    description_div.contentEditable = true;
    task_header_selector.className = 'textbox question-content';
    task_header_selector.innerHTML = task_selector.innerHTML;
    task_header_selector.selectedIndex = task_selector.selectedIndex;
    
    task_div.className = 'question-container';
    task_div.insertBefore(task_header_selector, null);
    task_div.insertBefore(remove_button, null);
    task_div.insertBefore(description_div, null);
    task_div.insertBefore(modifier_textbox, null);
    dialog_content.insertBefore(task_div, task_selector.parentElement);
    
    return task_div;
}

function open_task(no) {
    let tasks = document.getElementsByClassName('hidable-pane');
    for(let zed = 0; zed < tasks.length; zed++) {
        tasks[zed].className = tasks[zed].className.replace('visible', 'hidden');
    }
    tasks[no].className = tasks[no].className.replace('hidden', 'visible');
}

function show_tasks(json_data, task_panel) {
    task_panel.value = json_data[0][0][0];
    document.getElementById('activity_title').innerHTML = json_data[0][0][1];
    
    for(let x = 0; x < json_data.length; x++) {
        let topic_div = document.createElement('div');
        let topic_description = document.createElement('div');
        
        topic_description.innerHTML = json_data[x][0][3];
        topic_div.insertBefore(topic_description, null);
        task_panel.insertBefore(topic_div, null);
        
        add_task_item(json_data[x], topic_div);
    }
}

function add_task_item(json_data, topic_div) {
    for(let x = 1; x < json_data.length; x++) {
        let question_div = document.createElement('div');
        let container_div = document.createElement('div');
        let hider_div = document.createElement('div');
        let hider_button = document.createElement('button');
        
        container_div.className = 'hidable-pane hidable-pane-hidden';
        container_div.insertBefore(hider_div, null);
        hider_button.innerHTML = 'open content';
        hider_button.className = 'button-activity-editor';
        add_listener(hider_button, 'click', show_question);
        hider_div.insertBefore(hider_button, null);
        question_div.className = 'pane-inside';
        question_div.value = json_data[x][0];
        hider_div.insertBefore(question_div, null);
        open_question(json_data[x], question_div);
        topic_div.insertBefore(container_div, null);
    }
}

function show_question(event_handle) {
    let all_questions = document.getElementsByClassName('hidable-pane');
    let current_question = event_handle.srcElement.parentElement.parentElement;
    let parent_current = current_question.parentElement.parentElement;
    let current_open = parent_current.getElementsByClassName('hidable-pane-visible');
    if(current_open.length > 0) {
        let parent_div = current_open[0].parentElement;
        let heading_count = 0;
        for(let y = 0; y < parent_div.parentElement.children.length; y++) {
            if(parent_div == parent_div.parentElement.children[y]) break;
            heading_count += parent_div.parentElement.children[y].children.length - 1;
        }
        for(let y = 0; y < parent_div.children.length; y++) {
            // if(current_open[0] == parent_div.children[y]) alert('yes:' + (heading_count + y - 1));
            let index_of_open = heading_count + y - 1;
            if(current_open[0] == parent_div.children[y]) question_save_functions[index_of_open](current_open[0]);
        }
    }
    for(let x = 0; x < all_questions.length; x++) {
        all_questions[x].className = all_questions[x].className.replace('visible', 'hidden');
    }
    current_question.className = current_question.className.replace('hidden', 'visible');
}

function submit_finalize_answer() {
    let task_panel = document.getElementById('task_panel');
    let current_open = task_panel.getElementsByClassName('hidable-pane-visible');
    let all_questions = task_panel.getElementsByClassName('hidable-pane');
    if(current_open.length > 0) {
        let parent_div = current_open[0].parentElement;
        let heading_count = 0;
        for(let y = 0; y < parent_div.parentElement.children.length; y++) {
            if(parent_div == parent_div.parentElement.children[y]) break;
            heading_count += parent_div.parentElement.children[y].children.length - 1;
        }
        for(let y = 0; y < parent_div.children.length; y++) {
            // if(current_open[0] == parent_div.children[y]) alert('yes:' + (heading_count + y - 1));
            let index_of_open = heading_count + y - 1;
            if(current_open[0] == parent_div.children[y]) question_save_functions[index_of_open](current_open[0]);
        }
    }
    for(let x = 0; x < all_questions.length; x++) {
        all_questions[x].className = all_questions[x].className.replace('visible', 'hidden');
    }
    submit_user_answer();
}

function custom_query_initializer() {
    let execute_button = document.getElementById('btn_execute');
    add_listener(execute_button, 'click', question_save_functions[0]);
}

/**
SELECT user.last_name || ', ' || user.first_name AS full_name, user.username, user.username || '_student' AS password
FROM user
WHERE last_name LIKE '%%'
**/