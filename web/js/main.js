// Math.seedrandom(6831);

// ------------------------------------------------------------------------------
// Global variables

var c = {};
var log = [];
var lastId = "";
var nextIndex = -1;
var instructions = {};
instructions.rsvp = `<ul>
  <li> A series of images will be rapidly shown to you after you click 'Play'. </li>
  <li> After clicking 'Play', press <span class="positive-class positive-action kbd"></span> whenever you see <span class="positive-class"><span class="positive-label"></span></span>. </li>
  <li> The images will go by really fast so be prepared. </li>
  <li> We understand that you will not be able to react on time for
       all the correct images. So try to do the best you can. We
       know the answer to a few of the images and will accept your
       hit if you get those right. </li>
  <li> When the task is complete, press 'Next Task'. </li>
</ul>`;
instructions.traditional = `<ul>
  <li> A series of images will be shown to you after you click 'Play'. </li>
  <li> For each image, press <span class="positive-class positive-action kbd"></span> if the image <span class="positive-class">contains <span class="positive-label"></span></span>, and press <span class="negative-class negative-action kbd"></span> if the image <span class="negative-class">does not contain <span class="negative-label"></span></span>. </li>
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
  // Read parameters from url
  c.parameters = {
    n_interfaces    : { value: undefined, default: 2,         parser: parseInt },         // number of interfaces to randomly sample out of all interfaces
    n_tasks         : { value: undefined, default: 3,         parser: parseInt },         // number of tasks to random sample out of all tasks
    task_t          : { value: undefined, default: 500,       parser: parseInt },       // ms between images (rsvp only)
    task_t_end      : { value: undefined, default: 2500,      parser: parseInt },      // ms to wait after last image before cleaning up (rsvp only)
    task_length     : { value: undefined, default: 10,        parser: parseInt },        // number of images in task
    task_f_mean     : { value: undefined, default: 10,        parser: parseInt },        // mean of number of positive examples to show in each task, per 100
    task_f_std      : { value: undefined, default: 2,         parser: parseInt },         // std of number of positive examples to show
    task_f_override : { value: undefined, default: undefined, parser: parseInt }, // override for number of positive examples to show in each task, per 100
    uuid_override   : { value: undefined, default: undefined, parser: String }   // override for user id
  };

  for (var obj in c.parameters){
    var urlVar = $.getUrlVar(obj);
    if (urlVar){
      c.parameters[obj].value = c.parameters[obj].parser(urlVar);
    } else {
      c.parameters[obj].value = c.parameters[obj].default;
    }
  }

  c.playing           = false;
  c.links             = links;
  c.keys = {
    positive: { code: 74, character: 'j' },
    negative: { code: 70, character: 'f' }
  };


  c.interface_list    = ["traditional", "rsvp"];
  c.task_list = [
    { name: "easy"   , description: "a dog" },
    { name: "medium" , description: "a person on a motorcycle" },
    { name: "hard"   , description: "people eating breakfast" }
  ];
  c.interface_index   = 0;
  c.task_index        = 0;

  if (c.parameters.n_interfaces < c.interface_list.length){
    c.interface_list = _.sample(c.interface_list, c.parameters.n_interfaces);
  }
  if (c.parameters.n_tasks < c.task_list.length){
    c.task_list = _.sample(c.task_list, c.parameters.n_tasks);
  }

  c.interface_order   = _.shuffle(Array.apply(null, {length: c.interface_list.length}).map(Number.call, Number));
  c.task_order        = _.shuffle(Array.apply(null, {length: c.task_list.length}).map(Number.call, Number));

  c.interface         = c.interface_list[c.interface_order[c.interface_index]];
  c.task              = c.task_list[c.task_order[c.task_index]].name;

  c.data_url          = "http://web.mit.edu/micahs/www/rsvp/data";

  // user
  if (c.parameters.uuid_override.value) {
    c.uuid = c.paremeters.uuid_override.value;
  } else {
    c.uuid              = randomId();
  }
}

function prepareTask(){
  // number of images that are positive examples, per 100
  if (c.parameters.task_f_override.value){
    c.task_f = c.task_f_override.value;
  } else{
    c.task_f = randn_bm()*c.parameters.task_f_std.value + c.parameters.task_f_mean.value;
  }

  // interface type
  if (c.interface_index === 0){
    $("#interface_type").text("A");
  } else {
    $("#interface_type").text("B");
  }

  // instructions
  $("#instructions").empty();
  if (c.interface == "rsvp"){
    $("#instructions").append(instructions.rsvp);
  } else {
    $("#instructions").append(instructions.traditional);
  }

  // labels
  $(".positive-label").text(c.task_list[c.task_index].description);
  $(".negative-label").text(c.task_list[c.task_index].description);

  // actions
  $(".positive-action").html(c.keys.positive.character);
  $(".negative-action").html(c.keys.negative.character);
  
  // description
  if (c.interface == "traditional"){
    $(".negative-action-reminder").css({"visibility" : "visible"});
  } else {
    $(".negative-action-reminder").css({"visibility" : "hidden"});
  }

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
  num_positive_images_task = Math.round(c.task_f*c.parameters.task_length.value/100);
  num_positive_images_all  = c.links[c.task].positive.count;
  num_negative_images_task = c.parameters.task_length.value - num_positive_images_task;
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
  // image ids are formatted like `negative-0`
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
      '<img id="{0}" class="image-hidden" src="{1}/{2}/{3}/{4}.jpg" height="100%" width="100%">'.format(id, c.data_url, c.task, class_, index)
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
    if (i==c.parameters.task_length.value){
      c.playing = false;
      setTimeout(cleanUpRsvp, c.parameters.task_t_end.value);
    }
  }, c.parameters.task_length.value, c.parameters.task_t.value);
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
      c.task = c.task_list[c.task_order[c.task_index]].name;
    }
  } else {
    // next task
    c.task_index += 1;
    c.task = c.task_list[c.task_order[c.task_index]].name;
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
  evt.preventDefault();
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
    if (value == c.keys.positive.code) {
      pushLog(timestamp, c.uuid, c.interface, c.task, "key", "", value);
    }
  }
}

function processKeyTraditional(evt, timestamp){
  if (c.playing){
    value = evt.originalEvent.key;
    if (value == c.keys.positive.character || value == c.keys.negative.character) {
      pushLog(timestamp, c.uuid, c.interface, c.task, "key", "", value);

      // are we done?
      if (nextIndex == c.parameters.task_length.value){
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
  sendRapidCrowdsourcingLog(JSON.stringify(log));
  //sendRapidCrowdsourcingLogFake(JSON.stringify(log));

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

function randomId(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
  });
}
