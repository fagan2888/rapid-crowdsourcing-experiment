var c = {};

$(document).ready(function() {
  c.playing = false;
  downloadImages();
});

$(document).on("click", "#btn_play", function(evt) {
  console.log("about to play images");
  playImages();
});

// ------------------------------------------------------------------------------
// Mess with images

function downloadImages(){
  c.links = links;
}

function playImages(){
  // create an array of `n` images
  // set a timer to fire every `t` milleseconds
  // when timer fires, change src of image
  // at end, clear panel
  $( "#image_panel_image" ).attr({
    "src" : c.links.dogs.positive[0]
  });
}

function clearImages(){
}
