console.log('views loaded')

var HomeView = Parse.View.extend ({
	
	className: 'home-view',

	template: _.template($('.home-view-template').text()),

	events: {
		"click .login-button": "login",
		"click .sign-up-button": "signUp"
	},

	initialize: function () {
		console.log('initid')
		$('.container').prepend(this.el);
		this.render();
	},

	render: function(){
	    this.$el.html(this.template())
	    return this;
	},

	login: function() {

		router.navigate('#/login', {trigger: true})
	},

	signUp: function() {

		router.navigate('#/sign-up', {trigger: true})
	}


});

// User Login View

var LoginView = Parse.View.extend ({
	
	className: 'login-view',

	template: _.template($('.login-view-template').text()),

	events: {
		"click .submit-sign-up-button": "login"
	},

	initialize: function () {
		$('.container').prepend(this.el);
		this.render();
	},

	render: function(){
	    this.$el.html(this.template())
	    return this;
	},

	login: function() {

		Parse.User.logIn($('.login-username').val(), $('.login-password').val(), {
		  success: function(user) {
		    console.log('Succesfully logged in!')
		    $(".login-username").val('');
		    $(".login-password").val('');
		    router.navigate('#/dashboard')
		  },
		  error: function(user, error) {
		    console.log('Login failed')
		  }

		});
	}
});

// User Sign Up View

var SignUpView = Parse.View.extend ({
	
	className: 'sign-up-view',

	template: _.template($('.sign-up-view-template').text()),

	events: {
		"click .submit-sign-up-button": "signUp"
	},

	initialize: function () {
		$('.container').append(this.el);
		this.render();
	},

	render: function(){
	    this.$el.html(this.template())
	    return this;
	},

	signUp: function() {

			var user = new Parse.User();
			user.set("username", $('.sign-up-username').val() );
			user.set("password", $('.sign-up-password').val() );
			user.set("email", 	 $('.sign-up-email').val() );
		 

			user.signUp(null, {
			  success: function(user) {
			  	console.log('Succesfully created a new user!')
			  },
			  error: function(user, error) {
			  	console.log('No user was created')
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
	}
});