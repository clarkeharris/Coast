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
				$(".login-username").val('');
				$(".login-password").val('');

				router.navigate('dashboard', {
					trigger: true
				})

			},
			error: function(user, error) {
		
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
		
			router.navigate('#/dashboard', {
				trigger: true
			})
			
			},
			error: function(user, error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});

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
		// this.googleMaps();

		this.collection = new PostsCollection();
		this.collection.on('add', this.addPost)
		this.fetchPromise = this.collection.fetch({
			add: true
		});

		$('.search-region').keydown(function (key) {
			if(key.which === 13) {
				$('.search').click();
			}
		})


		this.fetchPromise.done(function() {
			// make sure all of the images are loaded first.
			imagesLoaded(document.querySelectorAll('.posts-view'), function() {
				var msnry = new Masonry($('.posts-container')[0], {
					// options
					columnWidth: 0,
					itemSelector: '.posts-view'
				});

				$('.posts-container').addClass('visible');

				$(".triangle").mouseenter(function(){
					var i = $('.triangle').index(this);
					$(".wind-right:eq("+i+")").css('opacity', 1);
					$(".wind-time:eq("+i+")").css('opacity', 1);
				}).mouseleave(function () {
						var i = $('.triangle').index(this);
						$(".wind-right:eq("+i+")").css('opacity', 0);
						$(".wind-time:eq("+i+")").css('opacity', 0);
				})
			})

		});


		var msnryGraphs = new Masonry($('#container')[0], {
			// options
			columnWidth: 0,
			itemSelector: '.item'
		});
	},

	render: function() {
		this.$el.html(this.template())
		return this;

	},

	addPost: function(photo) {
		new PostsView({
			model: photo
		});
	},

	logOut: function() {

		Parse.User.logOut();
		var currentUser = Parse.User.current();

		router.navigate('#/login', {
			trigger: true	
		})

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

    var that = this;
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
				var pointPromise = Parse.GeoPoint.current()
				pointPromise.done(function(latlong) {

					var point = new Parse.GeoPoint({
						
						latitude: latlong.latitude,
						longitude: latlong.longitude
					})

					uploadPhoto.set('location', point)
					uploadPhoto.save().done(function() {
						
						Parse.User.current().relation('posts').add(uploadPhoto);
						Parse.User.current().save();
					})
				})
			} else {
				uploadPhoto.save().done(function() {

					Parse.User.current().relation('posts').add(uploadPhoto);
					Parse.User.current().save();
				})

			}

			that.collection.add(uploadPhoto)

		})

	},

	forecastName: function() {

		var that = this;

		var surfSpot = new SpotsCollection();
		var name = $('.search-region').val().replace(' ', '-').replace(',', '').toLowerCase();

		$.get('http://0.0.0.0:3000/api/county/water-temperature/' + name).done(function(tempData) {
			$('.forecast-location').html('')
			$('.forecast-location').append(tempData.county)
			
			$('.water-temp').html('')
			$('.water-temp').append('Water Temperature:' + ' ' + tempData.fahrenheit)
		});

		$.get('http://0.0.0.0:3000/api/county/wind/' + name).done(function(data) {
			
			var windDegrees = _.pluck(data, 'direction_degrees')

			//
					var windSpeed = _.pluck(data, 'speed_mph')
					
					var evenWindSpeed = _.filter(windSpeed, function(num, index){ return index % 2 == 0; });
					
					var roundedWindSpeed = evenWindSpeed.map(Math.round);
					
					var time = _.pluck(data, 'hour');
					
					var evenTimes = _.filter(time, function(num, index){ return index % 2 == 0; });

					var windTimeArray = [];
					roundedWindSpeed.forEach(function(speed){
						 windTimeArray.push({
								windSpeedMph: speed
							})
					})
					evenTimes.forEach(function(time, index) {
						windTimeArray[index].hour = time
					})

					windTimeArray.forEach(function (data) {
						var template = _.template($('.wind-speed-template').text());
						var renderedTemplate = template(data)
						$('.wind').append(renderedTemplate)
					})

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
				swellChartData = swellChartData.map(function(num){
					return parseFloat(num.toFixed(2));
				});
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
<<<<<<< HEAD
			ctx.canvas.height = 320;
			// ctx.canvas.width = $("#wave-height-chart").width();
			// ctx.canvas.height = $("#wave-height-chart").height();
=======
			ctx.canvas.height = 275;
			ctx.canvas.width = $("#wave-height-chart").width();
			ctx.canvas.height = $("#wave-height-chart").height();
>>>>>>> final-countdown
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
			ctx.canvas.width = $("#tide-chart").width();
			ctx.canvas.height = $("#tide-chart").height();
			that.myLineChart = new Chart(ctx).Line(data, {
				caleShowGridLines: false,
				showTooltips: true,
				barShowStroke: false,
				scaleShowLabels: false,
				showScale: false
			});

		})
		this.googleMaps()
	},

	googleMaps: function() {

		function initialize() {

			var name = $('.search-region').val().replace(',', '').toLowerCase();

				$.get('http://0.0.0.0:3000/api/spot/all').done(function(data) {
			
					_.each(data, function(item){

					if ( item.county_name.replace ( '-' , ' ').toLowerCase() == name) {
						currentPosition.longitude = item.longitude;
						currentPosition.latitude =  item.latitude;
					}
			});

			var mapOptions = {
				center: new google.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
				zoom: 8
			};
			console.log('before map', mapOptions);

			var map = new google.maps.Map(document.getElementById("map-canvas"),
				mapOptions);

		});

			var mapOptions = {
				center: new google.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
				zoom: 1
			};

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
		renderTemplate = this.template(this.model.attributes);
		this.$el.html(renderTemplate)
		return this;
	}

});