Parse.initialize("BA1C8ZngmJPQ6vOTvtCCJq9SEWEBBAR5vPoNuxtE", "tAX4S5an89EtItKoTz8SsOrRr50VEZMoBUeshZ2J");

// User Sign Up

// $('.submit-sign-up-button').click(function() {

// 	var user = new Parse.User();
// 	user.set("username", $('.sign-up-username').val() );
// 	user.set("password", $('.sign-up-password').val() );
// 	user.set("email", 	 $('.sign-up-email').val() );
	 

// 	user.signUp(null, {
// 	  success: function(user) {
// 	  	console.log('Succesfully created a new user!')
// 	  },
// 	  error: function(user, error) {
// 	  	console.log('No user was created')
// 	    alert("Error: " + error.code + " " + error.message);
// 	  }
// 	});

// });


// User Logout 
$('.logout-button').click(function() {

	Parse.User.logOut();
	console.log('Logged out Succesfully!')
	var currentUser = Parse.User.current();

});

// // If User is not logged in

// redirectLogOut: function() { 
// if(!currentUser) router.navigate('sign-up', {trigger: true});
// }