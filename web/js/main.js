Math.seedrandom(6831);

// ------------------------------------------------------------------------------
// Global variables

var c = {};
var log = [];
var lastId = "";
var nextIndex = -1;
var instructions = {};
instructions.rsvp = `<ul>
  <li> A series of images will be rapidly shown to you after you click 'Play'. </li>
  <li> After clicking 'Play', press <span class="positive-class positive-class-action">the right arrow key</span> whenever you see a <span class="positive-class positive-class-label">dog</span>. </li>
  <li> The images will go by really fast so be prepared. </li>
  <li> We understand that you will not be able to react on time for
       all the correct images. So try to do the best you can. We
       know the answer to a few of the images and will accept your
       hit if you get those right. </li>
  <li> When the task is complete, press 'Next Task'. </li>
</ul>`;
instructions.traditional = `<ul>
  <li> A series of images will be shown to you after you click 'Play'. </li>
  <li> For each image, press <span class="positive-class positive-class-action">the right arrow key</span> if the image <span class="positive-class positive-class-label">contains a dog</span>, and press <span class="negative-class negative-class-action">the left arrow key</span> if the image <span class="negative-class positive-class-label">does not contain a dog</span>. </li>
  <li> Try to do the best you can. We know the answer to a few of the images. </li>
  <li> When the task is complete, press 'Next Task'. </li>
</ul>`;

// ------------------------------------------------------------------------------
// Setup document

$(document).ready(function() {
  initialize();
  prepareTask();
});

function initialize(){
  c.playing         = false;
  c.links           = links;
  c.interface_list  = ["traditional", "rsvp"];
  c.task_list       = ["easy", "medium", "hard"];
  c.task_descriptions = {
    positive : ["contains a dog", "contains a person on a motorcycle", "contains people eating breakfast"],
    negative : ["does not contain a dog", "does not contain a person on a motorcycle", "does not contain people eating breakfast"]
  };
  c.interface_index = 0;
  c.task_index      = 0;

  c.interface_order = _.shuffle(Array.apply(null, {length: c.interface_list.length}).map(Number.call, Number));
  c.task_order      = _.shuffle(Array.apply(null, {length: c.task_list.length}).map(Number.call, Number));

  c.interface       = c.interface_list[c.interface_order[c.interface_index]];
  c.task            = c.task_list[c.task_order[c.task_index]];

  c.task_t          = 500; // ms between images
  c.task_t_end      = c.task_t*5; // ms to wait after last image before cleaning up
  c.task_length     = 10; // number of images in task
  c.task_f_mean     = 10;  // mean of number of positive examples to show, per 100
  c.task_f_std      = 2;   // std of number of positive examples to show
  c.url = "http://web.mit.edu/micahs/www/rsvp/data";

  // user
  c.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
  });

}

function prepareTask(){
  // number of images that are positive examples, per 100
  c.task_f          = randn_bm()*c.task_f_std + c.task_f_mean;

  // instructions
  $("#instructions").empty();
  if (c.interface == "rsvp"){
    $("#instructions").append(instructions.rsvp);
  } else {
    $("#instructions").append(instructions.traditional);
  }

  // objects

  c.ids = fetchImages();
}

$(document).on("click", "#btn_play", function(evt) {
  disableButton("btn_play");

  // add countdown animation :)
  // also allows images to load
  myCountdown(4, function(){
    if (c.interface == "rsvp") {
      playImagesRsvp(c.ids);
    } else {
      playImagesTraditional(c.ids);
    }
  });
});

$(document).on("click", "#btn_next", function(evt) {
  disableButton("btn_next");
  prepareTask();
  enableButton("btn_play");
});

// ------------------------------------------------------------------------------
// Mess with images

/**
 * Return the ids of a random sample of images. Ids are formatted as
 * `class-index`, where class takes values `negative` or `positive`, and
 * `index` is a non-zero-padded integer.
 *
 * Parameters
 * c.task: the task (`"easy"`, `"medium"`, or `"hard"`)
 * c.task_length: the number of ids to return
 * c.task_f: the number of positive examples to show, per 100 examples
 */
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
      '<img id="{0}" class="image-hidden" src="{1}/{2}/{3}/{4}.jpg" height="100%" width="100%">'.format(id, c.url, c.task, class_, index)
    );
  }

  return ids;
}

function playImagesRsvp(ids){
  // create an array of `n` images
  // set a timer to fire every `t` milleseconds
  // when timer fires, change src of image
  // at end, clear panel
  c.playing = true;
  var i = 0;
  callNTimes(function() {
    showImage(ids[i]);
    i += 1;
    if (i==c.task_length){
      c.playing = false;
      setTimeout(cleanUpRsvp, c.task_t_end);
    }
  }, c.task_length, c.task_t);
}

function playImagesTraditional(ids){
  c.playing = true;
  // show first image
  nextIndex = 1;
  showImage(ids[0]);
}

function cleanUpRsvp(){
    flushLog(log);
    clearImages();
    console.log("done");
    prepareNextTask();
}

function cleanUpTraditional(){
    c.playing = false;
    flushLog(log);
    clearImages();
    console.log("done");
    prepareNextTask();
}

function completeExperimentation(){
  $("#btn_next").val("Done With Tasks");
  $(document).off("click", "#btn_next").on("click", "#btn_next", function() {
    window.location = "survey.html?uuid=" + c.uuid;
  });
  enableButton("btn_next");

}

function prepareNextTask(){
  if (c.task_index == (c.task_list.length - 1)){
    // done with this task.
    if (c.interface_index == (c.interface_list.length - 1)){
      // done with everything.
      completeExperimentation();
      return;
    } else {
      // next interface
      c.interface_index += 1;
      c.interface = c.interface_list[c.interface_order[c.interface_index]];
      c.task_index = 0;
      c.task = c.task_list[c.task_order[c.task_index]];
    }
  } else {
    // next task
    c.task_index += 1;
    c.task = c.task_list[c.task_order[c.task_index]];
  }
  enableButton("btn_next");
}

function showImage(id){
  console.log("showing {0}".format(id));
  if (lastId){
    $( "#" + lastId).removeClass("image-visible").addClass("image-hidden");
  }
  $( "#" + id).removeClass("image-hidden").addClass("image-visible");
  timestamp = Date.now();
  lastId = id;
  pushLog(timestamp, c.uuid, c.interface, c.task, "image", id, "");
}

// ------------------------------------------------------------------------------
// Handle user input

$(document).keypress(function(evt){
  timestamp = Date.now();
  if (c.interface == "rsvp"){
    processKeyRsvp(evt, timestamp);
  } else {
    processKeyTraditional(evt, timestamp);
  }
});

function processKeyRsvp(evt, timestamp){
  if (c.playing){
    value = evt.originalEvent.keyCode;
    if (value == 39){ // right arrow only
      pushLog(timestamp, c.uuid, c.interface, c.task, "key", "", value);
    }
  }
}

function processKeyTraditional(evt, timestamp){
  if (c.playing){
    value = evt.originalEvent.keyCode;
    console.log(value);
    if (value == 37 || value == 39){ // left arrow or right arrow only
      pushLog(timestamp, c.uuid, c.interface, c.task, "key", "", value);

      // are we done?
      if (nextIndex == c.task_length){
        // end play
        cleanUpTraditional();
      } else {
        // show next picture :)
        currentIndex = nextIndex;
        nextIndex += 1;
        showImage(ids[currentIndex]);
      }
    }
  }
}

function processButton(evt, timestamp){
  id = evt.target.id;
  pushLog(timestamp, c.uuid, c.interface, c.task, "button", id, "");
}

// ------------------------------------------------------------------------------
// Utility functions

function pushLog(timestamp, uuid, interface_, task, source, id, value){
      log.push({
        "timestamp" : timestamp,
        "uuid"      : uuid,
        "interface" : interface_,
        "task"      : task,
        "source"    : source,
        "id"        : id,
        "value"     : value
      });
}

function flushLog(log){
  sendRapidCrowdsourcingLogFake(JSON.stringify(log));

  // clear log
  log.length = 0;
}

function clearImages(){
  $( "#image_panel > img" ).remove();
}

function disableButton(id){
  $( "#" + id ).removeClass("btn-enabled").addClass("btn-disabled");
}
function enableButton(id){
  $( "#" + id ).removeClass("btn-disabled").addClass("btn-enabled");
}
