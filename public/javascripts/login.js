function send_login_request() {
    let form = get_form_data("login");
    send_api_call("/api/users/login", "POST", form, {
        success: function (data) {
            let future = new Date(Date.now() + 1000 * 60 * 60 * 24);
            document.cookie=`token=${data.token};expires=${future}`;
            document.location = "/"
        },
        error: function (data) {

        }
    });
    return false;
}

function send_registration_request() {
    let form = get_form_data("registration");
    form.email = form.email.toLowerCase().trim();
    let req = {username: form.username, password: form.password, email: form.email};

    let pass2Err = document.getElementById("password2Error"),
        passErr = document.getElementById("passwordError"),
        emailErr = document.getElementById("emailError"),
        usernameErr = document.getElementById("usernameError");

    passErr.innerHTML = pass2Err.innerHTML = emailErr.innerHTML = usernameErr.innerHTML = "";

    if(form.password !== form.password2) {
        pass2Err.innerHTML = "Password mismatch";
        return false;
    }
    if(form.password === null || form.password.length < 4){
       passErr.innerHTML = "Password length insufficient";
        return false;
    }if(form.username.indexOf(" ") !== -1){
        passErr.innerHTML = "Password format invalid";
        return false;
    }
    if(form.email.indexOf('@') === -1 || form.email.indexOf('.') === -1 || form.email.indexOf('@') >= form.email.lastIndexOf('.') || form.email.indexOf(' ') !== -1){
        emailErr.innerHTML = "Email format invalid";
        return false;
    }

    send_api_call(`/api/users/check?user=${form.username}`, "POST", form, {
        success: function (data) {
            if(data.exists){
                usernameErr.innerHTML = "Username already exists";
                return;
            }

            send_api_call("/api/users/register", "POST", form, {
                success: function (data) {
                    if(data.success){
                        //Success

                        document.location = `/login/post-reg?email=${encodeURI(req.email)}`;
                    }else
                    {
                        switch (data.reason){
                            case "username":
                                usernameErr.innerHTML="Username error";
                                break;
                            case "email":
                                emailErr.innerHTML="Email error";
                                break;
                            case "password":
                                passErr.innerHTML="Password error";
                                break;
                            case "emailExists":
                                emailErr.innerHTML="Email Address is already in use.";
                                break;
                            default:
                                usernameErr.innerHTML = "Unspecified error! Try again later."
                        }
                    }
                },
                error: function (data) {

                }
            });
        },
        error: function (data) {

        }
    });


    return false;
}

function calculateSecurity(password){
	let magnitude = 0;
	if(password.indexOf(/[a-z]/))
		magnitude += 26;
	if(password.indexOf(/[A-Z]/))
		magnitude += 26;
	if(password.indexOf(/[0-9]/))
		magnitude += 10;
	let otherChars = password.replace(/[a-zA-Z0-9]/g, '');
	let set = new Set();
	for (let i = 0; i < otherChars.length; i++){
		set.add(otherChars[i]);
	}
	magnitude+= set.length;
	return magnitude * password.length;

}

function send_validation_request() {
    let form = get_object();
    console.log(form);
    const status = document.getElementById("status");
    const further = document.getElementById("further");
    send_api_call("/api/users/validate", "POST", form, {
        success: function (data) {
            if(data.valid) {
                let past = new Date(0);
                document.cookie = `token=;expires=${past}`;
                status.innerText = "Success";
                further.innerHTML = `You may now <a href="/login">precede to login!</a>`;
            }else{
                status.innerText = "An error has occurred!";
                further.innerText = "No validation information found. Your account has either already been validated or does not exist.";
            }
        },
        error: function (data) {
            status.innerText = "A serious error has occurred!";
            further.innerText = "No validation information found. Your account has either already been validated or does not exist.";
        }
    });
    return false;
}