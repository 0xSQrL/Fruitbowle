
function clearToken(){
    document.cookie="token=; expires=01 Jan 1970 00:00:00 UTC";
    return true;
}

function send_api_call(target, method, json_data, response, token){
    let call = {
        url: target,
        type: method,
        data: JSON.stringify(json_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        ...response
    };
    if(token)
        call.beforeSend = function (xhrObj) {
            xhrObj.setRequestHeader("Authorization", `Bearer ${token}`);
        };
    $.ajax(call);
}

function get_form_data(form_name){
    let data = $(`#${form_name}`).serializeArray();
    let retData = {};
    data.forEach(function(elem){
        retData[elem.name] = elem.value;
    });
    return retData;
}

function force_only_number(form){
	setTimeout(function(){form.value = form.value.replace(/[^0-9]/g, '');}, 1);
}

function get_object(){
    let url = window.location.search.substr(1);
    let get_obj = {};
    while(url.indexOf('=') !== -1)
    {
        let end = url.indexOf('&');
        let equal = url.indexOf('=');
        if(end === -1)
        end = url.length;
        get_obj[url.substring(0, equal)] = url.substring(equal + 1, end);
        url = url.substring(end + 1);
    }
    return get_obj;
}

function removeElementById(id){
	let element = document.getElementById(id);
	element.parentElement.removeChild(element);
}