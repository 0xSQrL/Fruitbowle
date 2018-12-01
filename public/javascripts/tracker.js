function send_create_tracker_request() {
    let form = get_form_data("track_register");
    send_api_call("/api/tracker/register", "POST", form, {
        success: function (data) {

        },
        error: function (data) {

        }
    });
    return false;
}

function autoLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;
        });
    }else{

    }
}