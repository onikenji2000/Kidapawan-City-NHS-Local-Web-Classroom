let first_name_textbox = document.getElementById('first_name');
let middle_name_textbox = document.getElementById('middle_name');
let last_name_textbox = document.getElementById('last_name');
let sex_select = document.getElementById('sex_select');
let birthdate_text = document.getElementById('birth_date');
let username_textbox = document.getElementById('username');
let password_1_textbox = document.getElementById('password_1');
let password_2_textbox = document.getElementById('password_2');
let current_user_code_from_list = null;
let current_class_code = null;
let current_activity_no = null;
let list_question_type = [['identification.textbox', 'Identification']];
let question_json = null;
let temp = null;
let question_save_functions = null;

function update_user_profile() {
    let http = new XMLHttpRequest();
    let profile_data = new FormData();
    profile_data.append('first_name', first_name_textbox.value);
    profile_data.append('middle_name', middle_name_textbox.value);
    profile_data.append('last_name', last_name_textbox.value);
    profile_data.append('sex', sex_select.selectedOptions[0].innerHTML);
    profile_data.append('birth_date', birthdate_text.value);
    profile_data.append('update_type', 'user_profile');
    
    http.open('POST', 'update.user.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    };
    http.send(profile_data);
}

function update_user_security() {
    if(password_1_textbox.value === password_2_textbox.value) {
        let http = new XMLHttpRequest();
        let account_data = new FormData();
        account_data.append('username', username_textbox.value);
        account_data.append('password', password_1_textbox.value);
        account_data.append('update_type', 'user_account');
        http.open('POST', 'update.user.php', true);
        http.onload = function() {
            if(http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
            }
        };
        http.send(account_data);
    }
    else {
        alert('The passwords you entered did not match!');
        password_1_textbox.focus();
    }
}

function logout() {
    if(confirm('Are you sure you want to logout?')) {
        let http = new XMLHttpRequest();
        let logout_data = new FormData();
        logout_data.append('logout', 'log me out');
        http.open('POST', 'login.php', true);
        http.onload = function() {
            if(http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
                location.reload();
            }
        };
        http.send(logout_data);
    }
}

function open_content_page(page_open) {
    let http = new XMLHttpRequest();
    http.open('GET', page_open, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            activities.innerHTML = http.responseText;
            hide_loaded();
            if(page_open == 'student.list.html') {
                let user_table = document.getElementById('user_table');
                load_students(user_table);
            }
            else if(page_open == 'class.list.html') load_classes();
            else if(page_open == 'class.setting.html') load_user_list(null);
            else if(page_open == 'teacher.class.activity.html') load_editable_activities();
            else if(page_open == 'class.view.html') load_class_view();
            else if(page_open == 'test.bank.html') {
                set_add_topic_button();
                load_topics();
                refresh_question_type_list();
            }
            else if(page_open == 'activity.show.html') load_student_activity(current_activity_no);
            else if(page_open == 'custom.query.html') custom_query_functions();
        }
    };
    http.send();
}

function load_students(user_table) {
    let http = new XMLHttpRequest();
    http.open('GET', 'load.students.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            user_table.innerHTML = http.responseText;
        }
    };
    http.send();
}

function search_students(user_table) {
    let category = document.getElementById('search_category').selectedOptions[0].value;
    let search_text = document.getElementById('search_textbox').value;
    let http = new XMLHttpRequest();
    let search_data = new FormData();
    
    search_data.append('column_search', category);
    search_data.append('text_search', search_text);
    http.open('POST', 'load.students.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            user_table.innerHTML = http.responseText;
        }
    };
    http.send(search_data);
}

function save_new_user() {
    let first_name = document.getElementById('new_user_first_name');
    let middle_name = document.getElementById('new_user_middle_name');
    let last_name = document.getElementById('new_user_last_name');
    let user_type = document.getElementById('new_user_usertype').selectedOptions[0].value;
    let http = new XMLHttpRequest();
    let new_user_data = new FormData();
    
    new_user_data.append('first_name', first_name.value);
    new_user_data.append('middle_name', middle_name.value);
    new_user_data.append('last_name', last_name.value);
    new_user_data.append('user_type', user_type);
    
    http.open('POST', 'new.user.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
            let fullname = first_name.value + ' ' + last_name.value;
            let new_user = '<tr><td>' + http.responseText + '</td><td>' + fullname +
                           '</td><td>undefined</td><td>' + user_type + '</td><td><button>[]</button></td></tr>';
            let user_table = document.getElementById('user_table');
            user_table.innerHTML = user_table.innerHTML + new_user;
            first_name.value = '';
            middle_name.value = '';
            last_name.value = '';
            toggle_visibility('new_user_pane');
            
        }
    };
    http.send(new_user_data);
}

function reset_password() {
    let http = new XMLHttpRequest();
    let reset_data = new FormData();
    
    reset_data.append('command', 'reset_password');
    reset_data.append('user_code', current_user_code_from_list);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    };
    http.send(reset_data);
}

function save_new_class() {
    let http = new XMLHttpRequest();
    let class_code = document.getElementById('new_class_code_textbox');
    let class_name = document.getElementById('new_class_name_textbox');
    let class_data = new FormData();
    
    class_data.append('command', 'new_class');
    class_data.append('class_code', class_code.value);
    class_data.append('class_name', class_name.value);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
            class_code.value = '';
            class_name.value = '';
            close_new_class();
            load_classes();
        }
    };
    http.send(class_data);
}

function load_classes() {
    let http = new XMLHttpRequest();
    let class_list = document.getElementById('class_list');
    let class_data = new FormData();
    
    class_data.append('command', 'load_classes');
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            class_list.innerHTML = http.responseText;
        }
    }
    http.send(class_data);
}

function load_class_settings() {
    let class_code_textbox = document.getElementById('update_class_code');
    let class_name_textbox = document.getElementById('update_class_name');
    let search_textbox = document.getElementById('search_user_textbox');
    let http = new XMLHttpRequest();
    let class_data = new FormData();
    
    class_data.append('command', 'load_class_settings');
    class_data.append('class_code', current_class_code);
    search_textbox.removeEventListener('keyup', search_name_of_user);
    search_textbox.addEventListener('keyup', search_name_of_user);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
            let strings = http.responseText.split("\n");
            class_code_textbox.value = strings[0];
            class_name_textbox.value = strings[1];
        }
    }
    http.send(class_data);
}

function load_user_list(search_text) {
    load_class_settings();
    let http = new XMLHttpRequest();
    let user_list = document.getElementById('user_list');
    let user_data = new FormData();
    
    user_data.append('command', 'load_users');
    user_data.append('class_code', current_class_code);
    if(search_text != '' && search_text != null) {
        let category = document.getElementById('search_param');
        user_data.append('search_category', category.selectedOptions[0].value);
        user_data.append('search_text', search_text);
    }
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
            user_list.innerHTML = http.responseText;
        }
    }
    http.send(user_data);
}

function toggle_student_class(user_id) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'toggle_user_class');
    data.append('user_code', user_id);
    data.append('class_code', current_class_code);
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            if(http.responseText == 'FAIL') {
                alert('Err: The operation failed to be recorded. Kindly refresh the page.');
            }
        }
    }
    http.send(data);
}

function update_class() {
    let class_code_textbox = document.getElementById('update_class_code');
    let class_name_textbox = document.getElementById('update_class_name');
    let http = new XMLHttpRequest();
    let class_data = new FormData();
    
    class_data.append('command', 'update_class');
    class_data.append('class_code', current_class_code);
    class_data.append('class_code_new', class_code_textbox.value);
    class_data.append('class_name', class_name_textbox.value);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    }
    http.send(class_data);
}

function search_name_of_user(event_handle) {
    if(event_handle.code == 'Enter') {
        let search_textbox = document.getElementById("search_user_textbox");
        let search_text = search_textbox.value;
        load_user_list(search_text);
    }
}

function load_editable_activities_list() {
    let add_new_topic_button = document.getElementById('add_new_topic');
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'load_activities');
    data.append('class_code', current_class_code);
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
            let activity_board = document.getElementById('activity_board');
            let button_add_content = document.getElementById('add_new_topic');
            let button_add_activity = null;
            let data = JSON.parse(http.responseText);
            let activity_ul = null;
            let activity_li = null;
            let content_li = null;
            
            for(data_counter = 0; data_counter < data.length; data_counter++) {
                if(content_li == null || content_li.children[0].innerHTML != data[data_counter][1]) {
                    let bold_text = document.createElement('b');
                    activity_ul = document.createElement('ul');
                    content_li = document.createElement('li');
                    activity_li = document.createElement('li');
                    button_add_activity = document.createElement('button');
                    
                    button_add_activity.className = 'button-activity-editor';
                    button_add_activity.innerHTML = '(+) Activity';
                    add_listener(button_add_activity, 'click', add_new_activity);
                    activity_ul.insertBefore(activity_li, null);
                    activity_li.insertBefore(button_add_activity, null);
                    bold_text.className = 'editable-element';
                    bold_text.contentEditable = true;
                    bold_text.innerHTML = data[data_counter][1];
                    add_listener(bold_text, 'focusout', topic_focus_out);
                    content_li.insertBefore(activity_ul, null);
                    content_li.insertBefore(bold_text, activity_ul);
                    activity_board.insertBefore(content_li, button_add_content.parentElement);
                }
                let load_activity_li = document.createElement('li');
                let text_label = document.createElement('label');
                let button_update = document.createElement('button');
                text_label.value = data[data_counter][0];
                text_label.innerHTML = data[data_counter][2];
                text_label.className = 'activity-link editable-element';
                text_label.contentEditable = true;
                add_listener(text_label, 'focusout', topic_focus_out);
                
                button_update.className = 'button-activity-editor';
                button_update.innerHTML = '&#9998';
                add_listener(button_update, 'click', open_activity_dialog);
                
                load_activity_li.insertBefore(button_update, null);
                load_activity_li.insertBefore(text_label, button_update);
                activity_ul.insertBefore(load_activity_li, button_add_activity.parentElement);
                
            }
        }
    };
    http.send(data);
    
    add_listener(add_new_topic_button, 'click', insert_topic);
}

function load_editable_activities() {
    load_editable_activities_list();
    let class_title_textbox = document.getElementById('class_header');
    let http = new XMLHttpRequest();
    let class_data = new FormData();
    
    class_data.append('command', 'load_class_settings');
    class_data.append('class_code', current_class_code);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            // alert(http.responseText);
            let strings = http.responseText.split("\n");
            class_title_textbox.innerHTML = strings[1];
        }
    }
    http.send(class_data);
}

function save_new_activity(source_element) {
    let activity_title = source_element.innerHTML;
    let activity_id = source_element.value;
    let content = source_element.parentElement.parentElement.parentElement.children[0].innerHTML;
    let http = new XMLHttpRequest();
    let class_data = new FormData();
    
    class_data.append('command', 'insert_activity');
    class_data.append('class_code', current_class_code);
    class_data.append('content', content);
    class_data.append('activity_title', activity_title);
    class_data.append('activity_id', activity_id);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        source_element.value = http.responseText;
        source_element.className = 'activity-link editable-element';
        source_element.contentEditable = true;
    };
    http.send(class_data);
}

function load_class_view() {
    let http = new XMLHttpRequest();
    let class_view_data = new FormData();
    
    class_view_data.append('command', 'load_activities');
    class_view_data.append('class_code', current_class_code);
    
    http.open('POST', 'student.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            // alert(http.responseText);
            let activity_board = document.getElementById('activity_board');
            let button_add_content = document.getElementById('add_new_topic');
            let class_header = document.getElementById('class_header');
            let button_add_activity = null;
            let data = JSON.parse(http.responseText);
            let activity_ul = null;
            let activity_li = null;
            let content_li = null;
            
            class_header.innerHTML = data[0];
            data = data[1];
            
            for(data_counter = 0; data_counter < data.length; data_counter++) {
                if(content_li == null || content_li.children[0].innerHTML != data[data_counter][1]) {
                    let bold_text = document.createElement('b');
                    activity_ul = document.createElement('ul');
                    content_li = document.createElement('li');
                    activity_li = document.createElement('li');
                    
                    activity_ul.insertBefore(activity_li, null);
                    bold_text.innerHTML = data[data_counter][1];
                    content_li.insertBefore(activity_ul, null);
                    content_li.insertBefore(bold_text, activity_ul);
                    activity_board.insertBefore(content_li, null);
                }
                let load_activity_li = document.createElement('li');
                let text_label = document.createElement('label');
                text_label.value = data[data_counter][0];
                text_label.innerHTML = data[data_counter][2];
                text_label.className = 'activity-link';
                add_listener(text_label, 'click', function(event_handle) {
                    open_display('open_current_activity' + event_handle.srcElement.value);
                });
                
                load_activity_li.insertBefore(text_label, null);
                activity_ul.insertBefore(load_activity_li, null);
                
            }
        }
    };
    http.send(class_view_data);
}

function select_type_question(event_handle) {
    let question_type_select = event_handle.srcElement;
    let div_topic = question_type_select.parentElement;
    let http = new XMLHttpRequest();
    let select_val = question_type_select.selectedOptions[0].value;
    let url_string = '././template/' + select_val + '/teacher.html';
    
    http.open('GET', url_string, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let question_div = document.createElement('div');
            let question_content = null;
            let save_button = document.createElement('button');
            let delete_button = document.createElement('button');
            
            save_button.value = question_type_select.selectedOptions[0].value;
            save_button.className = 'button-test-bank button-test-floating';
            delete_button.className = 'button-test-bank button-test-floating';
            save_button.style = 'background-color: #33ff00';
            save_button.innerHTML = 'SAVE';
            delete_button.innerHTML = 'DELETE';
            // add_listener(save_button, 'click', save_question);
            add_listener(delete_button, 'click', delete_question);
            
            div_topic.insertBefore(question_div, question_type_select);
            question_div.innerHTML = http.responseText;
            question_div.insertBefore(save_button, null);
            question_div.insertBefore(delete_button, null);
            question_div.style = 'background-color: #8afd8a; border-radius: 3px;';
            question_div.value = '-';
            question_content = question_div.getElementsByClassName('question-content')[0];
            question_content.focus();
            question_type_select.remove();
            if (question_save_functions == null) question_save_functions = [];
            load_question_logic([null, select_val], question_div, save_button);
        }
    };
    http.send();
}

function delete_question(event_handle) {
    console.log(event_handle.srcElement);
}

function load_topics() {
    let test_bank = document.getElementById('test_bank');
    let add_new_topic_box = document.getElementById('add_new_topic_box');
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'load_topics');
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let topics = JSON.parse(http.responseText);
            for(let topic_counter = 0; topic_counter < topics.length; topic_counter++) {
                let add_new_question_button = null;
                let div_topic = document.createElement('div');
                let topic_text = topics[topic_counter];
                let html_test_topic = '<h4 class="topic-header" contenteditable="true">' + topic_text + '</h4>' +
                                      '<b class="three-dots">...</b><button class="button-test-bank">ADD NEW QUESTION</button>';
                
                div_topic.className = 'topic-box topic-box-hidden';
                test_bank.insertBefore(div_topic, add_new_topic_box);
                setTimeout(function() {
                    div_topic.innerHTML = html_test_topic;
                    let three_dots = div_topic.getElementsByClassName('three-dots')[0];
                    div_topic.className = 'topic-box topic-box-visible';
                    add_new_question_button = div_topic.getElementsByClassName('button-test-bank')[0];
                    div_topic.insertBefore(three_dots, add_new_question_button);
                    add_listener(add_new_question_button, 'click', set_add_question_button);
                    load_questions(div_topic, three_dots, topic_text);
                }, 10);
            }
        }
    }
    http.send(data);
}

function load_questions(topic_div, three_dots, topic_text) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'load_questions');
    data.append('topic', topic_text);
    
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let questions = JSON.parse(http.responseText);
            question_save_functions = [];
            for(question_counter = 0; question_counter < questions.length; question_counter++) {
                load_individual_question(topic_div, three_dots, questions[question_counter], question_counter == (questions.length - 1));
            }
        }
    }
    http.send(data);
}

function load_individual_question(topic_div, three_dots, question, last) {
    let div_topic = topic_div;
    let http = new XMLHttpRequest();
    let url_string = '././template/' + question[1] + '/teacher.html';
    
    http.open('GET', url_string, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let question_div = document.createElement('div');
            let question_content = null;
            let save_button = document.createElement('button');
            let delete_button = document.createElement('button');
            
            save_button.value = question[1];
            save_button.className = 'button-test-bank button-test-floating';
            delete_button.className = 'button-test-bank button-test-floating';
            save_button.style = 'background-color: #33ff00';
            save_button.innerHTML = 'SAVE';
            delete_button.innerHTML = 'DELETE';
            add_listener(delete_button, 'click', delete_question);
            
            div_topic.insertBefore(question_div, three_dots);
            question_div.innerHTML = http.responseText;
            question_div.style = 'background-color: #8afd8a; border-radius: 3px;';
            question_div.insertBefore(save_button, null);
            question_div.insertBefore(delete_button, null);
            question_div.value = question[0];
            
            load_question_logic(question, question_div, save_button);
            if(last) three_dots.remove();
        }
    }
    http.send();
}

function load_question_logic(question_data, question_div, save_button) {
    let http = new XMLHttpRequest();
    let url_string = '././template/' + question_data[1] + '/teacher.question.data.js';
    
    http.open('GET', url_string, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let result = eval(http.responseText);
            let save_question_function = save_question;
            question_save_functions.push(save_question_function);
            load_question_data(question_data, question_div);
            add_listener(save_button, 'click', question_save_functions[question_save_functions.length - 1]);
        }
    };
    http.send();
}

function available_tasks(dialog_content, task_selector, activity_no) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'load_topics');
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let topics = JSON.parse(http.responseText);
            dialog_content.value = activity_no;
            task_selector.innerHTML = '<option class="unselectable">SELECT FROM A TOPIC</option>';
            for(let option_counter = 0; option_counter < topics.length; option_counter++) {
                let topic_option = document.createElement('option');
                topic_option.innerHTML = topics[option_counter];
                topic_option.value = topics[option_counter];
                task_selector.insertBefore(topic_option, null);
            }
            add_listener(task_selector, 'change', function(event_handle) {
                if(task_selector.selectedIndex == 0) return;
                let selected_topic = task_selector.selectedOptions[0].value;
                create_blank_task(dialog_content, task_selector, selected_topic);
                task_selector.selectedIndex = 0;
            });
            load_existing_tasks(dialog_content, task_selector, activity_no);
        }
    };
    http.send(data);
}

function load_existing_tasks(dialog_content, task_selector, activity_no) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'load_activity_topic');
    data.append('activity_no', activity_no);
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let task_data = JSON.parse(http.responseText);
            for(let task_counter = 0; task_counter < task_data.length; task_counter++) {
                let task_div = create_blank_task(dialog_content, task_selector, task_data[task_counter]);
                let task_selector_new = task_div.getElementsByClassName('question-content')[0];
                let task_modifier_text =task_div.getElementsByClassName('modifier-textbox')[0];
                let selected_index = 0;
                for(let selection_counter = 0; selection_counter < task_selector_new.length; selection_counter++) {
                    if(task_data[task_counter][1] == task_selector_new.options[selection_counter].value) {
                        selected_index = selection_counter;
                        break;
                    }
                }
                task_div.value = task_data[task_counter][0];
                task_selector_new.selectedIndex = selected_index;
                task_modifier_text.value = task_data[task_counter][3];
                task_div.getElementsByClassName('question-content')[1].innerHTML = task_data[task_counter][2];
            }
        }
    };
    http.send(data);
}

function save_tasks(event_handle) {
    let dialog = event_handle.srcElement.parentElement.parentElement;
    let dialog_content = dialog.getElementsByClassName('dialog-content')[0];
    let tasks_div = dialog_content.getElementsByClassName('question-container');
    let http = new XMLHttpRequest();
    let data = new FormData();
    let task_data = [];
    let activity_no = dialog_content.value;
    
    for(let task_counter = 0; task_counter < tasks_div.length; task_counter++) {
        let activity_topic_id = tasks_div[task_counter].value;
        let topic_text = tasks_div[task_counter].getElementsByTagName('select')[0].selectedOptions[0].value;
        let description = tasks_div[task_counter].getElementsByClassName('question-box')[0].innerHTML;
        let modifier = tasks_div[task_counter].getElementsByClassName('modifier-textbox')[0].value;
        task_data.push([activity_topic_id, topic_text, description, modifier]);
    }
    data.append('command', 'save_activity_topic');
    data.append('activity_no', activity_no);
    data.append('task_json', JSON.stringify(task_data));
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            tasks_data = JSON.parse(http.responseText);
            for(let task_counter = 0; task_counter < tasks_data.length; task_counter++) {
                tasks_div[task_counter].value = tasks_data[task_counter];
            }
            alert('SUCCESS: All tasks has been updated');
        }
    };
    http.send(data);
}

function load_student_activity(activity_no) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    question_save_functions = [];
    data.append('command', 'current_activity');
    data.append('activity_no', activity_no);
    http.open('POST', 'student.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let tasks_data = JSON.parse(http.responseText);
            let task_panel = document.getElementById('task_panel');
            show_tasks(tasks_data, task_panel);
            if(tasks_data[0]['score']) {
                let submit_button = document.getElementById('submit_answers').parentElement;
                task_panel.innerHTML = '<div><h1>You have Finished this Activity.</h1><h2>Your Score here is ' + tasks_data[0]['score'] + '</h2></div>';
                submit_button.remove();
                return;
            }
            question_json = tasks_data;
            add_listener(document.getElementById('submit_answers'), 'click', submit_finalize_answer);
            // console.log(tasks_data);
        }
    };
    http.send(data);
}

function open_question(json_data, container_div) {
    let http = new XMLHttpRequest();
    let location = '././template/' + json_data[1] + '/student.html';
    http.open('GET', location, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            container_div.innerHTML = http.responseText;
            //let question_box = container_div.getElementsByClassName('question-content')[0];
            //question_box.value = json_data[0];
            //question_box.innerHTML = json_data[2];
            question_logic(json_data, container_div);
        }
    };
    http.send();
}

function question_logic(json_data, container_div) {
    let http = new XMLHttpRequest();
    let location = '././template/' + json_data[1] + '/student.question.data.js';
    http.open('GET', location, true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let result = eval(http.responseText);
            load_question_data(json_data, container_div);
            question_save_functions.push(save_question_data);
        }
    };
    http.send();
}

function refresh_question_type_list() {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'reload_question_type');
    http.open('POST', 'student.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            list_question_type = JSON.parse(http.responseText);
        }
    };
    http.send(data);
}

function submit_user_answer() {
    let http = new XMLHttpRequest();
    let data = new FormData();
    
    data.append('command', 'submit_finalize');
    data.append('activity_no', current_activity_no);
    http.open('POST', 'student.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
            if(http.responseText == '1') {
                load_student_activity(current_activity_no);
            }
        }
    };
    http.send(data);
}


function custom_query_functions() {
    let http = new XMLHttpRequest();
    http.open('GET', 'js/custom.query.js', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let zoom = eval(http.responseText);
            question_save_functions = [query_view];
            custom_query_initializer();
        }
    };
    http.send();
}
//TODO