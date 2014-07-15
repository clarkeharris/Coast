Parse.initialize("BA1C8ZngmJPQ6vOTvtCCJq9SEWEBBAR5vPoNuxtE", "tAX4S5an89EtItKoTz8SsOrRr50VEZMoBUeshZ2J");


$(document).ready(function() {
  $('.upload-feature').click(function() {
    var $lefty = $(this).next();
    $lefty.animate({
      left: parseInt($lefty.css('left'),10) == 0 ?
        -$lefty.outerWidth()	 :
        0
    });
  });
});


$('.county-name').blur(function(){
	var name = $(this).val();

	$.get('http://0.0.0.0:3000/api/county/wind/' + name).done(function(data){
		console.log('wind speeds for', name, 'are', _.pluck(data, 'speed_mph'))
	});
})
		

// // If User is not logged in

// redirectLogOut: function() { 
// if(!currentUser) router.navigate('sign-up', {trigger: true});
// }