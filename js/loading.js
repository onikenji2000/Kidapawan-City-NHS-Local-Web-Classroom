
function show_loading_hud(loading) {
    let loading_elements = loading.children;
    let element_class = ['o1', 'o2', 'o3'];
    
    for(let element_counter = 0; element_counter < loading_elements.length; element_counter++) {
        let loading_element = loading_elements[element_counter];
        loading_element.className = 'loading-object ' + element_class[element_counter];
    }
    
    loading.style.display = 'block';
}

function hide_loading_hud(loading) {
    let loading_elements = loading.children;
    
    for(let element_counter = 0; element_counter < loading_elements.length; element_counter++) {
        let loading_element = loading_elements[element_counter];
        loading_element.className = 'loading-object';
    }
    
    loading.style.display = 'none';
}