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
	const form_id = "track_request";
	let form = get_form_data(form_id);
	let userRequestError = document.getElementById("userRequestError");

	send_api_call("/api/tracker/tracking", "POST", form, {
		success: function (data) {
			document.location.reload();
		},
		error: function (data) {
			userRequestError.innerText = "An error occurred while processing your request."
		}
	});
	return false;
}

function send_check_in(status) {
	const form_id = "checkInForm";
	let form = get_form_data(form_id);
	form.status = status;
	const checkinStatus = document.getElementById("checkinStatus");
	const userStatus = document.getElementById("userStatus");

	send_api_call("/api/tracker/checkin", "POST", form, {
		success: function (data) {

			checkinStatus.removeAttribute('class');
			if(data.success) {
				userStatus.innerHTML = user_status_to_string(data.status);
				checkinStatus.innerHTML = `Check in of '${user_status_to_string(data.status)}' made ${new Date(data.time_made)}.`;
				if(status !== data.status) {

					checkinStatus.setAttribute('class', 'error');
					checkinStatus.innerHTML += 'You must enter your PIN to lower your status.'
				}
			}else{
				checkinStatus.setAttribute('class', 'error');

				checkinStatus.innerHTML = `An error has occurred while making your check in.`
			}
		},
		error: function (data) {

		}
	});
	return false;
}


function tracker_approve(user_id) {
	let form = {tracker_id : user_id, approval: true};

	send_api_call("/api/tracker/trackedby", "PUT", form, {
		success: function (data) {
			document.location.reload();
		},
		error: function (data) {
		}
	});
	return false;
}


function tracker_reject(user_id) {
	let form = {tracker_id : user_id, approval: false};

	send_api_call("/api/tracker/trackedby", "PUT", form, {
		success: function (data) {
			document.location.reload();
		},
		error: function (data) {
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

function loadUserSchedule(intoElement){
	const element = document.getElementById(intoElement);
	element.innerHTML = "";


    send_api_call("/api/tracker/schedule", "GET", {}, {
        success: function (data) {
        	for(let i = 0; i < data.length; i++){
        		let scheduleElem = data[i];
        		element.innerHTML += `
        		<form>
        		<input name="id" value="${scheduleElem.id}" hidden>
        		Check in time: <input type="time" name="time"> Minus Buffer: <input type="time" name="minus_time" value="00:30:00"> Plus Buffer: <input type="time" name="plus_time" value="00:30:00"><br>
        		Days: <input type="checkbox" name="on_days[0]"> Sunday <input type="checkbox" name="on_days[1]"> Monday <input type="checkbox" name="on_days[2]"> Tuesday <input type="checkbox" name="on_days[3]"> Wednesday <input type="checkbox" name="on_days[4]"> Thursday <input type="checkbox" name="on_days[5]"> Friday <input type="checkbox" name="on_days[6]"> Saturday 
        		<input type="submit" onclick=""
        		</form>

					`;
			}
        },
        error: function (data) {
        }
    });
}


function autoLocation(){
	const checkstatus = document.getElementById("checkinStatus");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            document.getElementsByName('latitude')[0].value = position.coords.latitude;
            document.getElementsByName('longitude')[0].value = position.coords.longitude;
			document.getElementById('goodCI').disabled = false;
			document.getElementById('nervCI').disabled = false;
			document.getElementById('emerCI').disabled = false;
        }, function(){

			checkstatus.setAttribute('class', 'error');
			checkstatus.innerText = 'You must have location enabled to check in.'
		});
    }else{
		checkstatus.setAttribute('class', 'error');
		checkstatus.innerText = 'You must have location enabled to check in.'
    }
}