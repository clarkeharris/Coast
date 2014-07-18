console.log('views loaded')

var AppView = Parse.View.extend({

	className: "post-view"

});

var app = new AppView();

var HomeView = Parse.View.extend({

	className: 'home-view',

	template: _.template($('.home-view-template').text()),

	events: {
		"click .direct-to-login-button": "login",
		"click .sign-up-button": "signUp"
	},

	initialize: function() {
		console.log('initid')
		$('.container').prepend(this.el);
		$( ".posts-container" ).hide()
		this.render();
	},

	render: function() {
		this.$el.html(this.template())
		return this;
	},

	login: function() {

		router.navigate('#/login', {
			trigger: true
		})
	},

	signUp: function() {

		router.navigate('#/sign-up', {
			trigger: true
		})
	}


});

// User Login View

var LoginView = Parse.View.extend({

	className: 'login-view',

	template: _.template($('.login-view-template').text()),

	events: {
		"click .login-button": "login"
	},

	initialize: function() {
		$('.container').prepend(this.el);
		this.render();
	},

	render: function() {
		this.$el.html(this.template())
		return this;
	},

	login: function() {

		Parse.User.logIn($('.login-username').val(), $('.login-password').val(), {
			success: function(user) {
				console.log('Succesfully logged in!')
				$(".login-username").val('');
				$(".login-password").val('');

				router.navigate('dashboard', {trigger: true})

			},
			error: function(user, error) {
				console.log('Login failed')
			}

		});
	}
});

// User Sign Up View

var SignUpView = Parse.View.extend({

	className: 'sign-up-view',

	template: _.template($('.sign-up-view-template').text()),

	events: {
		"click .submit-sign-up-button": "signUp"
	},

	initialize: function() {
		$('.container').append(this.el);
		$( ".posts-container" ).hide()
		this.render();
	},

	render: function() {
		this.$el.html(this.template())
		return this;
	},

	signUp: function() {

		var user = new Parse.User();
		user.set("username", $('.sign-up-username').val());
		user.set("password", $('.sign-up-password').val());
		user.set("email", $('.sign-up-email').val());


		user.signUp(null, {
			success: function(user) {
				console.log('Succesfully created a new user!')
			},
			error: function(user, error) {
				console.log('No user was created')
				alert("Error: " + error.code + " " + error.message);
			}
		});

		router.navigate('#/dashboard')	

	}

});

var currentPosition = {};

var DashboardView = Parse.View.extend({

	className: 'dashboard-view',

	template: _.template($('.dashboard-view-template').text()),

	events: {
		"click .upload-button": "uploadPhoto",
		"click .logout-button": "logOut",
		"click .upload-feature": "uploadFeature",
		"click .search": "forecastName"
	},

	initialize: function() {
		$('.container').append(this.el);
		this.render();
		this.forecastName();
		this.googleMaps();

		this.collection = new PostsCollection();
		this.collection.on('add', this.addPost)
		this.fetchPromise = this.collection.fetch({
			add: true
		});

		this.fetchPromise.done(function() {
			console.log('DONE!')
			// make sure all of the images are loaded first.
			imagesLoaded(document.querySelectorAll('.posts-view'), function() {
				console.log('IMAGES LOADED!')
				var msnry = new Masonry($('.posts-container')[0], {
					// options
					columnWidth: 0,
					itemSelector: '.user-posts'
				});

				$('.posts-container').addClass('visible');
			})

		});

		var msnryGraphs = new Masonry($('#container')[0], {
			// options
			columnWidth: 0,
			itemSelector: '.item'
		});

		console.log('fetchPromise is', this.fetchPromise)
	},

	render: function() {
		this.$el.html(this.template())
		return this;

	},

	addPost: function(photo) {
		console.log('photo is', photo)
		new PostsView({
			model: photo
		});
	},

	logOut: function() {

		Parse.User.logOut();
		console.log('Logged out Succesfully!')
		var currentUser = Parse.User.current();

		router.navigate('#/login')

	},

	uploadFeature: function() {

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

		uploadPromise.done(function() {

			var uploadPhoto = new Parse.Object("UploadPhoto");
			uploadPhoto.set("parent", Parse.User.current().attributes.username);
			uploadPhoto.set("photo", parseFile.url());
			uploadPhoto.set("photoRef", parseFile);
			uploadPhoto.set("wave_height", $(".wave-height-selection option:selected").text());
			uploadPhoto.set("wind_direction", $(".wind-direction-selection option:selected").text());
			uploadPhoto.set("tide", $(".tides-selection option:selected").text());
			uploadPhoto.set("crowd", $(".crowd-selection option:selected").text());
			uploadPhoto.set("caption", $('.caption').val());

			if ($('.current-location').is(':checked')) {
				console.log("checked")
				var pointPromise = Parse.GeoPoint.current()
				console.log(pointPromise)
				pointPromise.done(function(latlong) {

					console.log('latlong', latlong)
					console.log(latlong.latitude)
					console.log(latlong.longitude)
					
					var point = new Parse.GeoPoint({
						
						latitude: latlong.latitude,
						longitude: latlong.longitude
					})
					console.log(point)

					uploadPhoto.set('location', point)
					uploadPhoto.save().done(function() {
						
						Parse.User.current().relation('posts').add(uploadPhoto);
						Parse.User.current().save();
					})
				})
			} else {
				console.log("un-checked")
				uploadPhoto.save().done(function() {

					Parse.User.current().relation('posts').add(uploadPhoto);
					Parse.User.current().save();
				})

			}

			app.collection.add(uploadPhoto)

			// if you wanna fetch current user's posts later, it's
			// Parse.User.current().relation('posts').query().find().done(function(postsList){
			//    do cool stuff here 
			// });
			console.log("Upload Successful")

		})

	},

	forecastName: function() {
		console.log('running forecastName')

		var that = this;

		// var surfSpot = new SpotsCollection();

		var name = $('.search-region').val().replace(' ', '-').replace(',', '').toLowerCase();

		$.get('http://0.0.0.0:3000/api/county/water-temperature/' + name).done(function(tempData) {
			$('.forecast-location').html('')
			$('.forecast-location').append(tempData.county)
			
			$('.water-temp-fahrenheit').html('')
			$('.water-temp-celcius').html('')
			$('.water-temp-fahrenheit').append(tempData.fahrenheit + 'F')
			$('.water-temp-celcius').append(tempData.celcius + 'C')
		});

		$.get('http://0.0.0.0:3000/api/county/wind/' + name).done(function(data) {
			
			var windDegrees = _.pluck(data, 'direction_degrees')

			//
					var windSpeed = _.pluck(data, 'speed_mph')
					
					var evenWindSpeed = _.filter(windSpeed, function(num, index){ return index % 2 == 0; });
					
					var roundedWindSpeed = evenWindSpeed.map(Math.round);
					
					console.log(roundedWindSpeed);

					roundedWindSpeed.forEach(function(speed){
				var windSp = {
					windSpeedMph: speed
				}

				var template = _.template($('.wind-speed-template').text());
				var renderedTemplate = template(windSp)
				$('.wind').append(renderedTemplate)

			})

			//
				
				var evenWindDegrees = _.filter(windDegrees, function(num, index){ return index % 2 == 0; });

			evenWindDegrees.forEach(function(direction){
				var windOb = {
					windDirection: direction
				}

				var template = _.template($('.arrow-template').text());
				var renderedTemplate = template(windOb)
				$('.wind').append(renderedTemplate)

			})
		});

		$.get('http://0.0.0.0:3000/api/spot/all').done(function(data) {

			_.each(data, function(item){

					if ( item.county_name.toLowerCase() == name) {
						currentPosition.longitude = item.longitude;
						currentPosition.latitude =  item.latitude;
					}
			});

			// console.log('the current position', currentPosition.longitude + ' ' + currentPosition.latitude);

		});

		$.get('http://0.0.0.0:3000/api/county/swell/' + name).done(function(data) {
			
			_.each(data, function(item) {

				_.each(item, function(subItem) {

				})
			});
		});

		$.get('http://0.0.0.0:3000/api/county/swell/' + name).done(function(data) {
			var swellChartLabels = [];
			var swellChartData = [];
			
			_.each(data, function(item) {
				swellChartLabels.push(item.hour);
				swellChartData.map(Math.round);
				swellChartData.push(item.hst * 3);
			
			});

			var swellInfo = {
				labels: swellChartLabels,
				datasets: [{
					label: "Swell Height",
					fillColor: "rgba(7,60,96,1)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					highlightFill: "rgba(95,149,214,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: swellChartData
				}]
			};

			// clear out existing bar chart
			if (that.myBarChart) {
				that.myBarChart.destroy();
			}

			var ctx = document.getElementById("wave-height-chart").getContext("2d");
			ctx.canvas.width = 530;
			ctx.canvas.height = 150;
			// ctx.canvas.width = $("#wave-height-chart").width();
			// ctx.canvas.height = $("#wave-height-chart").height();
			that.myBarChart = new Chart(ctx).Bar(swellInfo, {
				scaleShowGridLines: false,
				showTooltips: true,
				barShowStroke: false,
				scaleShowLabels: false,
				showScale: false
			});
		});

		$.get('http://0.0.0.0:3000/api/county/tide/' + name).done(function(data) {
			var tidesArrayHour = _.pluck(data, 'hour');
			var tidesArrayHeight = _.pluck(data, 'tide');
			console.log(tidesArrayHeight)

			var evenTidesHour = _.filter(tidesArrayHour, function(num, index){ return index % 2 == 0; });

			var evenTides = _.filter(tidesArrayHeight, function(num, index){ return index % 2 == 0; });
				var roundedTides = evenTides.map(Math.round);

			var currentDate = _.pluck(data, 'date')[0];

			$('.date').html('')
			$('.date').append(currentDate)
			

			var data = {
				labels: evenTidesHour,
				datasets: [{
					label: "Tides",
					fillColor: "rgba(220,220,220,0.0)",
					strokeColor: "rgba(255,255,255,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "rgba(220,220,220,0.0)",
					pointHighlightFill: "rgba(251,61,73,1)",
					pointHighlightStroke: "rgba(220,220,220,0.0)",
					data: roundedTides
				}]
			};

			// clear out existing line chart
			if (that.myLineChart) {
				that.myLineChart.destroy();
			}

			var ctx = document.getElementById("tide-chart").getContext("2d");
			ctx.canvas.width = 505;
			ctx.canvas.height = 70;
			// ctx.canvas.width = $("#tide-chart").width();
			// ctx.canvas.height = $("#tide-chart").height();
			that.myLineChart = new Chart(ctx).Line(data, {
				caleShowGridLines: false,
				showTooltips: true,
				barShowStroke: false,
				scaleShowLabels: false,
				showScale: false
			});

		})

	},

	googleMaps: function() {

		function initialize() {

			var name = $('.search-region').val().replace(' ', '-').replace(',', '').toLowerCase();

				$.get('http://0.0.0.0:3000/api/spot/all').done(function(data) {
					console.log('looking for', name);
			_.each(data, function(item){

					if ( item.county_name.replace ( '-' , ' ').toLowerCase() == name) {
						currentPosition.longitude = item.longitude;
						currentPosition.latitude =  item.latitude;
					}
			});

			console.log('the current position', currentPosition.longitude + ' ' + currentPosition.latitude);

			var mapOptions = {
				center: new google.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
				zoom: 8
			};
			console.log('before map', mapOptions);

			var map = new google.maps.Map(document.getElementById("map-canvas"),
				mapOptions);

			console.log('after map ', mapOptions);

		});

			var mapOptions = {
				center: new google.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
				zoom: 1
			};
			console.log(mapOptions);
			var map = new google.maps.Map(document.getElementById("map-canvas"),
				mapOptions);

		}

		initialize();

	}

});

var PostsView = Parse.View.extend({

	className: 'posts-view',

	template: _.template($('.posts-view-template').text()),

	events: {},

	initialize: function() {
		$('.posts-container').append(this.el);
		this.render();
	},

	render: function() {
		// console.log('PostsView this.model is', this.model)
		renderTemplate = this.template(this.model.attributes);
		this.$el.html(renderTemplate)
		return this;
	}

});