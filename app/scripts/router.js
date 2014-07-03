console.log('router file loaded')

var AppRouter = Backbone.Router.extend({

	routes: {
		""      		      : 	"homePage",
		"login"      		  : 	"loginPage",
		"sign-up"      		  : 	"signUpPage",
		"dashboard/:user" 	  : 	"cool",
		"post" 				  : 	"post",
		"profile/:username"   : 	"userProfile"
	},

	initialize: function() {
		console.log('router initialize')
	},

	homePage: function() {
		$('.container').html('')
		new HomeView();
	},

	cool: function() {
		console.log('hi')
	},

	loginPage: function(){
		$('.container').html('')
		new LoginView();
	},

	signUpPage: function(){
		$('.container').html('')
		new SignUpView();
	},

	dashboard: function(user) {
		
	}


});

var router = new AppRouter();
Backbone.history.start();