console.log('views loaded')

var AppView = Parse.View.extend ({

	className: "post-view",

	initialize: function() {
		this.collection = new PostsCollection();
		this.collection.on('add', this.addPost)
		this.fetchPromise = this.collection.fetch({add:true});
		console.log('fetchPromise is', this.fetchPromise)
	},

	addPost: function (photo) {
		// new PostsView({model: photo});
	}

});

var app = new AppView();

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
    this.map();
		
	},

	render: function(){
    this.$el.html(this.template())
    return this;

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
		uploadPhoto.set("photoRef", parseFile);
		uploadPhoto.set("wave_height", $( ".wave-height-selection option:selected" ).text() );
		uploadPhoto.set("wind_direction", $( ".wind-direction-selection option:selected" ).text() );
		uploadPhoto.set("tide", $( ".tides-selection option:selected" ).text() );
		uploadPhoto.set("crowd", $( ".crowd-selection option:selected" ).text() );
		uploadPhoto.set("caption", $('.caption').val() );

		if ($('.current-location').is(':checked')){
			console.log("checked")
			var pointPromise = Parse.GeoPoint.current()
			console.log(pointPromise)
			pointPromise.done(function(latlong){
				console.log('latlong', latlong)
				console.log(latlong.latitude)
				console.log(latlong.longitude)
				var point = new Parse.GeoPoint({latitude: latlong.latitude, longitude: latlong.longitude})
				console.log(point)
				uploadPhoto.set('location', point)
				uploadPhoto.save().done(function(){
					Parse.User.current().relation('posts').add(uploadPhoto);
					Parse.User.current().save();
				})
			})
		} else {
			console.log("un-checked")
			uploadPhoto.save().done(function(){
				Parse.User.current().relation('posts').add(uploadPhoto);
				Parse.User.current().save();
			})

		}

		// app.collection.add(uploadPhoto)



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
	console.log(geoPromise);

	geoPromise.done(function(latlong){
		console.log(latlong)



		var baseUrl = "http://maps.googleapis.com/maps/api/staticmap?zoom=13&size=640x250&center=" + latlong.latitude + ',' + latlong.longitude 
		console.log(baseUrl)
		var counter = 0

		console.log(postsCollection)

		app.fetchPromise.done(function () {

			if (app.collection.length > 0){

				app.collection.each(function(post){
					if (post.get('location')) {
						baseUrl += "&markers=color:" + '0x'+Math.floor(Math.random()*16777215).toString(16) + "%7Clabel:"+ "COOL" +"%7C" + post.get('location').latitude + ',' + post.get('location').longitude
					}


					if (post === app.collection.last()) {
						console.log('baseUrl is',baseUrl)
						$('.map-container').attr('src', baseUrl);
					}
				})
			} else {
				$('.container').append('<img src="'+ baseUrl +'"/>')
			}
		})
	})

}

});

