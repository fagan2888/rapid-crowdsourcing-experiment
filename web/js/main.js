var c = {};

$(document).ready(function() {
  initialize();
  ids = fetchImages();
  c.ids = ids; // TODO
});

$(document).on("click", "#btn_play", function(evt) {
  console.log("about to play images");
  ids = c.ids; // TODO
  playImages(ids);
});

function initialize(){
  c.playing     = false;
  c.links       = links;
  c.task        = "easy";
  c.task_t      = 100; // ms between images
  c.task_length = 100; // number of images in task
  c.task_f_mean = 10;  // mean of number of positive examples to show, per 100
  c.task_f_std  = 2;   // std of number of positive examples to show

  // number of images that are positive examples, per 100
  c.task_f      = randn_bm()*c.task_f_std + c.task_f_mean;

  c.url = "http://web.mit.edu/micahs/www/rsvp/data";
}

// ------------------------------------------------------------------------------
// Mess with images

function sampleImages(){
  // sample image ids
  num_positive_images_task = Math.round(c.task_f*c.task_length/100);
  num_positive_images_all  = c.links[c.task].positive.count;
  num_negative_images_task = c.task_length - num_positive_images_task;
  num_negative_images_all  = c.links[c.task].negative.count;
  positive_images = _.sample(
    Array.apply(null, {length: num_positive_images_all}).map(Number.call, Number),
    num_positive_images_task 
  );
  negative_images = _.sample(
    Array.apply(null, {length: num_negative_images_all}).map(Number.call, Number),
    num_negative_images_task 
  );

  console.log(num_positive_images_task);
  console.log(num_negative_images_task);
  console.log(positive_images);
  console.log(negative_images);

  // populate image ids and shuffle them
  // image ids are formatted like `negative/0`
  ids = [];
  for (let i=0; i<positive_images.length; i++){
    ids.push("{0}-{1}".format("positive", positive_images[i]));
  }
  for (let i=0; i<negative_images.length; i++){
    ids.push("{0}-{1}".format("negative", negative_images[i]));
  }
  ids = _.shuffle(ids);

  return ids;
}

function fetchImages(){
  ids = sampleImages();

  // add imgs to panel
  for (var i=0; i<ids.length; i++){
    id     = ids[i];
    tmp    = id.split("-");
    class_ = tmp[0];
    index  = tmp[1];
    $( "#image_panel" ).append(
      '<img id="{0}" class="image-hidden" src="{1}/{2}/{3}/{4}.jpg" height="100%" width="100%"></img>'.format(id, c.url, c.task, class_, index)
    );
  }

  return ids;
}

function playImages(ids){
  // create an array of `n` images
  // set a timer to fire every `t` milleseconds
  // when timer fires, change src of image
  // at end, clear panel
  var i = 0;
  callNTimes(function() {
    console.log("showing image {0}".format(ids[i]));
    showImage(ids[i]);
    i += 1;
  }, c.task_length, c.task_t);
}

function showImage(id){
  $( "#image_panel > img" ).removeClass("image-visible").addClass("image-hidden");
  $( "#" + id).removeClass("image-hidden").addClass("image-visible");
}

function clearImages(){
  $( "#image_panel > img" ).remove();
}
