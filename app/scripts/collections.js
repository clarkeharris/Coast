var PostsCollection = Parse.Collection.extend ({
	model: PostModel
});

var SpotsCollection = Backbone.Collection.extend({
  model: ForecastModel,
  // url: 'http://0.0.0.0:3000/api.spitcast.com/api/spot/all',

});

