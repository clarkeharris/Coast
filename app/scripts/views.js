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
		// $('.log').addClass('slide')


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
		"click .login-button": "login"
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

var DashboardView = Parse.View.extend({

	className: 'dashboard-view',

	template: _.template($('.dashboard-view-template').text()),

	events: {
			"click .upload-button": "uploadPhoto",
			"click .logout-button": "logOut"
	},

	initialize: function() {
		$('.container').append(this.el);
		this.render();
		
	},

	render: function(){
    this.$el.html(this.template())
    return this;
    map();

	},

	logOut: function() {

	Parse.User.logOut();
	console.log('Logged out Succesfully!')
	var currentUser = Parse.User.current();

	router.navigate('#/login')

	},

	uploadPhoto: function() {

		var fileUploadControl = $(".file-uploader")[0];
		if (fileUploadControl.files.length > 0) {

		  var file = fileUploadControl.files[0];
		  var name = "photo.jpg";
	 
	  	var parseFile = new Parse.File(name, file);
		}

		var uploadPromise = parseFile.save()

		uploadPromise.then(function() {
		console.log("Mostly Succesful")
		}, function(error) {
			console.log("Upload Failed")
		});

		uploadPromise.done(function(){

		var uploadPhoto = new Parse.Object("UploadPhoto");
		uploadPhoto.set("parent", Parse.User.current().attributes.username);
		uploadPhoto.set("photo", parseFile.url() );
		uploadPhoto.set("caption", $('.caption').val() );
		uploadPhoto.set("photoRef", parseFile);

		if ($('.checkbox').is(':checked')){
		
			geoPromise = Parse.GeoPoint.current()
			geoPromise.done(function(latlong){
			uploadPhoto.set('latlong', latlong);
			
		}	else {

		}

		// app.collection.add(uploadPhoto)

		uploadPhoto.save().done(function(){
			Parse.User.current().relation('posts').add(uploadPhoto);
			Parse.User.current().save();
		})

		// if you wanna fetch current user's posts later, it's
		// Parse.User.current().relation('posts').query().find().done(function(postsList){
		//    do cool stuff here 
		// });
		console.log("Upload Successful")

	})

},

map: function() {
	console.log('wow!')
	geoPromise = Parse.GeoPoint.current()

	geoPromise.done(function(latlong){

		var baseUrl = "http://maps.googleapis.com/maps/api/staticmap?zoom=13&size=400x400&center=" + latlong.latitude + ',' + latlong.longitude 
		console.log(baseUrl)
		$('container').append('<img src="'+ baseUrl +'"/>')

		postsCollection.each(function(post){
			if (post.get('address')) {
				baseUrl += "&markers=color:" + post.get('color') + "%7Clabel:"+ post.get('name') +"%7C" + post.get('address')
			} else if (post.get('latlong')) {
				baseUrl += "&markers=color:" + post.get('color') + "%7Clabel:"+ post.get('name') +"%7C" + post.get('latlong').latitude + ',' + post.get('latlong').longitude
			}
		})
		console.log('wow!')
	})

}

});

