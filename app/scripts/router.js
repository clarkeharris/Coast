console.log('router file loaded')

var AppRouter = Backbone.Router.extend({

	routes: {
		""      		      : 	"homePage",
		"login"      		  : 	"loginPage",
		"sign-up"      		  : 	"signUpPage",
		"dashboard/:userId" 	  : 	"dashboardPage",
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

	dashboard: function() {
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

	dashboardPage: function(userId) {
		$('.container').html('')
		new DashboardView({model: window.currentUser});
		// console.log(Parse.Current.user)
		
		console.log(userId)
	}


});

var router = new AppRouter();
Backbone.history.start();