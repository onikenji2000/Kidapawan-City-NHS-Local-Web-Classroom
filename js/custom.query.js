function query_view(event_handle) {
    let http = new XMLHttpRequest();
    let data = new FormData();
    let textbox = document.getElementById('custom_query_text');
    let table_view = document.getElementById('table_view');
    
    data.append('command', 'custom_query');
    data.append('query', textbox.value);
    http.open('POST', 'admin.function.php', true);
    http.onload = function() {
        if(http.readyState == 4 && http.status == 200) {
            let query_data = JSON.parse(http.responseText);
            if(query_data[0]['isupdate']) {
                table_view.innerHTML = '<h3>UPDATED</h3>';
            }
            else {
                let keys = Object.keys(query_data[0]);
                let table = '<table class="table"><tr>';
                for(let i = 0; i < keys.length; i++) {
                    table = table + '<th>' + keys[i] + '</th>';
                }
                table = table + '</tr>';
                for(let i = 0; i < query_data.length; i++) {
                    table = table + '<tr>';
                    for(let z = 0; z < keys.length; z++) {
                        table = table + '<td>' + query_data[i][keys[z]] + '</td>';
                    }
                    table = table + '</tr>';
                }
                table = table + '</table>';
                table_view.innerHTML = table;
            }
        }
    };
    http.send(data);
}