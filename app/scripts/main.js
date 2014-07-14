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

var container = document.querySelector('#container');
var msnry = new Masonry( container, {
  // options
  columnWidth: 200,
  itemSelector: '.item'
});


		

// // If User is not logged in

// redirectLogOut: function() { 
// if(!currentUser) router.navigate('sign-up', {trigger: true});
// }