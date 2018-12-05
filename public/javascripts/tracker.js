function send_create_tracker_request() {
	const reg_form_id = "track_register";
	let form = get_form_data(reg_form_id);
	let pinError = document.getElementById("pinError");
	if(form.pin.length !== 4) {
		pinError.innerHTML = "Your PIN number needs to be <b>4 digits</b> long.";
		return false;
	}
	send_api_call("/api/tracker/register", "POST", form, {
		success: function (data) {
			if(data.success)
				document.location.reload();
			else
				pinError.innerText = "An error occurred while processing your request. Perhaps you already have an account."
		},
		error: function (data) {
			pinError.innerText = "An error occurred while processing your request."
		}
	});
	return false;
}

function user_request() {
	const reg_form_id = "track_request";
	let form = get_form_data(reg_form_id);
	let pinError = document.getElementById("pinError");
	if(form.pin.length !== 4) {
		pinError.innerHTML = "Your 4 digit PIN number needs to be <b>4 digits</b> long.";
		return false;
	}
	send_api_call("/api/tracker/register", "POST", form, {
		success: function (data) {
			if(data.success)
				document.location.reload();
			else
				pinError.innerText = "An error occurred while processing your request. Perhaps you already have an account."
		},
		error: function (data) {
			pinError.innerText = "An error occurred while processing your request."
		}
	});
	return false;
}


function user_status_to_string(val){
	switch (val) {
		case 0: return 'Ok';
		case 1: return 'Not Checked in';
		case 2: return 'Nervous';
		case 3: return 'Danger';
		default: return 'Undefined';
	}
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