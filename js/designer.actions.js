function add_listener(acting_element, event_type, action_function) {
    if(HTMLCollection.prototype.isPrototypeOf(acting_element)) {
        for(let element_counter = 0; element_counter < acting_element.length; element_counter++) {
            acting_element[element_counter].addEventListener(event_type, action_function);
        }
    }
    else {
        acting_element.addEventListener(event_type, action_function);
    }
}