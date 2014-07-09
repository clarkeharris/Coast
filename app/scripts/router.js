console.log('router file loaded')

var AppRouter = Backbone.Router.extend({

	routes: {
		""      		      : 	"homePage",
		"login"      		  : 	"loginPage",
		"sign-up"      		  : 	"signUpPage",
		"dashboard" 	  	  : 	"dashboardPage",
		"post" 				  : 	"post",
		"profile/:username"   : 	"userProfile"
	},

	initialize: function() {
		console.log('router initialize')
		postsCollection = new PostsCollection()
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

	dashboardPage: function() {
		console.log()
		$('.container').html('')
		new DashboardView({model: Parse.User.current()});
		
	}


});

var router = new AppRouter();
Backbone.history.start();