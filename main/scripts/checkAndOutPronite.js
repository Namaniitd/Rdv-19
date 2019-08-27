function logout(){
	localStorage.removeItem('Pronite');
    window.location.reload();
}

function check(){
	var el = document.getElementById("thug");
	console.log(el)
	var token = getToken();
	if(token==null){
		window.location.href = "/pronite/login";
	}else{
		// may check via re login
		$.post("/pronite/login",{"token":token})
		.done(function(data,status) {
			console.log("in done checker")
			console.log(window.location.pathname)
			// localStorage.setItem('UserPronite',JSON.stringify(data.user));
			localStorage.setItem('Pronite', data.token);
			if(window.location.pathname == "/pronite/login"){
				window.location.href = "/pronite/passbook";
			}
			// for setting name
			if(window.location.pathname=="/pronite/passbook"){
		        var el = document.getElementById("username");
		        el.innerHTML = data.user.first_name;
		        el = document.getElementById("points");
		        el.innerHTML = data.user.rdv_points;
		        el = document.getElementById("rdvid");
		        el.innerHTML = data.user.rdv_number;;
		        // el = document.getElementById("b1");
		        // el.value = "Saved";
		        if(data.user.melange){
		        	console.log("melange---------")
		        	var set = data.user.melange;
		        	if(set.startsWith("Booked")){
				        $("#b1 span").text("Booked");
			            $("#b1").attr('disabled','disabled');
			            	}
				    else if(set.startsWith("Waitlist")){
				        $("#b1 span").text("Waitlisted");
		            $("#b1").attr('disabled','disabled');
				    }
				    else
				        $("#b1 span").text("Download Pass");
		        }
		        if(data.user.dhoom){
		        	var set = data.user.dhoom;
		        	if(set.startsWith("Booked")){
				        $("#b2 span").text("Booked");
            $("#b2").attr('disabled','disabled');

		        	}
				    else if(set.startsWith("Waitlist")){
				        $("#b2 span").text("Waitlisted");
            $("#b2").attr('disabled','disabled');

				    }
				    else
				        $("#b2 span").text("Download Pass");
		        }
		        if(data.user.spectrum){
		        	var set = data.user.spectrum;
		        	if(set.startsWith("Booked")){
				        $("#b3 span").text("Booked");
            $("#b3").attr('disabled','disabled');

		        	}
				    else if(set.startsWith("Waitlist")){
				        $("#b3 span").text("Waitlisted");
            $("#b3").attr('disabled','disabled');

				    }
				    else
				        $("#b3 span").text("Download Pass");
		        }
		        if(data.user.kaleidoscope){
		        	var set = data.user.kaleidoscope;
		        	if(set.startsWith("Booked")){
				        $("#b4 span").text("Booked");
            $("#b4").attr('disabled','disabled');

		        	}
				    else if(set.startsWith("Waitlist")){
				        $("#b4 span").text("Waitlisted");
            $("#b4").attr('disabled','disabled');

				    }
				    else
				        $("#b4 span").text("Download Pass");
		        }
		        // console.log(data.user)
			}

			if(window.location.pathname=="/pronite/confirm"){
		        var el = document.getElementById("username");
		        el.innerHTML = data.user.first_name;
		        el = document.getElementById("points");
		        el.innerHTML = data.user.rdv_points;
		        el = document.getElementById("rdvid");
		        el.innerHTML = data.user.rdv_number;;
		        // el = document.getElementById("b1");
		        // el.value = "Saved";
		        if(data.user.melange){
		        	var set = data.user.melange;
		        	if(set.startsWith("Booked"))
				        $("#b1 span").text("Confirm Pass");
				    else if(set.startsWith("Waitlist"))
				        $("#b1 span").text("Waitlisted");
				    else
				        $("#b1 span").text("Download Pass");
		        }
		        if(data.user.dhoom){
		        	var set = data.user.dhoom;
		        	if(set.startsWith("Booked"))
				        $("#b2 span").text("Confirm Pass");
				    else if(set.startsWith("Waitlist"))
				        $("#b2 span").text("Waitlisted");
				    else
				        $("#b2 span").text("Download Pass");
		        }
		        if(data.user.spectrum){
		        	var set = data.user.spectrum;
		        	if(set.startsWith("Booked"))
				        $("#b3 span").text("Confirm Pass");
				    else if(set.startsWith("Waitlist"))
				        $("#b3 span").text("Waitlisted");
				    else
				        $("#b3 span").text("Download Pass");
		        }
		        if(data.user.kaleidoscope){
		        	var set = data.user.kaleidoscope;
		        	if(set.startsWith("Booked"))
				        $("#b4 span").text("Confirm Pass");
				    else if(set.startsWith("Waitlist"))
				        $("#b4 span").text("Waitlisted");
				    else
				        $("#b4 span").text("Download Pass");
		        }
		        // console.log(data.user)
			}
		}).fail(function(a,b,c){
			console.log(a);
			console.log(b);
			console.log(c);
			localStorage.removeItem('Pronite');
			window.href="/pronite/login"
		})
	}
}

function getToken() {
  const token = localStorage.getItem('Pronite');
  if (typeof(token) === "undefined" || !token || token === '')
    return null;
  return token;
}