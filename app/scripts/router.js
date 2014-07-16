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
		$('.posts-container').html('')
		new HomeView();
	},

	loginPage: function(){
		$('.container').html('')
		$('.posts-container').html('')
		new LoginView();
	},

	signUpPage: function(){
		$('.container').html('')
		$('.posts-container').html('')
		new SignUpView();
	},

	dashboardPage: function() {
		$('.container').html('')
		new DashboardView({model: Parse.User.current()});
	}


});


var router = new AppRouter();
Backbone.history.start();