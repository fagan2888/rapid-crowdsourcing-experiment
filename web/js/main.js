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
    n_interfaces    : { value: undefined, default: 2,         parser: parseInt }, // number of interfaces to randomly sample out of all interfaces
    n_tasks         : { value: undefined, default: 3,         parser: parseInt }, // number of tasks to random sample out of all tasks
    n_easy          : { value: undefined, default: 36,        parser: parseInt }, // number of easy images total
    n_medium        : { value: undefined, default: 36,        parser: parseInt }, // number of medium images total
    n_hard          : { value: undefined, default: 36,        parser: parseInt }, // number of hard images total
    n_other         : { value: undefined, default: 612,       parser: parseInt }, // number of other images total (negative for all classes)
    task_t          : { value: undefined, default: 100,       parser: parseInt }, // ms between images (rsvp only)
    task_t_end      : { value: undefined, default: 1500,      parser: parseInt }, // ms to wait after last image before cleaning up (rsvp only)
    task_length     : { value: undefined, default: 240,       parser: parseInt }, // number of images in each task
    uuid_override   : { value: undefined, default: undefined, parser: String },   // override for user id
    testing         : { value: undefined, default: false,     parser: (x) => x==="true" } // whether we are testing => don't write to real log
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
  c.keys = {
    positive: { code: 74, character: 'j' },
    negative: { code: 70, character: 'f' }
  };
  c.reminder_flash_t  = 25;


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

  // root directory of data. exclude trailing '/'
  c.data_url          = "https://s3.amazonaws.com/mit-micahs-rsvp-data";

  // user
  if (c.parameters.uuid_override.value) {
    c.uuid = c.paremeters.uuid_override.value;
  } else {
    c.uuid              = randomId();
  }

}

/*
 * Called at the beginning of the task. Sets up text and fetches images.
 */
function prepareTask(){

  if (c.task_index === 0){
    prepareInterface();
  }

  // instructions
  $("#instructions").empty();
  if (c.interface == "rsvp"){
    $("#instructions").append(instructions.rsvp);
  } else {
    $("#instructions").append(instructions.traditional);
  }

  // labels
  description = c.task_list[c.task_order[c.task_index]].description;
  $(".positive-label").text(description);
  $(".negative-label").text(description);

  // actions
  $(".positive-action").html(c.keys.positive.character);
  $(".negative-action").html(c.keys.negative.character);
  
  // description
  if (c.interface == "traditional"){
    $(".negative-action-reminder").css({"visibility" : "visible"});
  } else {
    $(".negative-action-reminder").css({"visibility" : "hidden"});
  }

  fetchImages(c.samples[c.task].ids);

  $("#btn_play").val("loading images...");
  $("#image_panel").append(
    '<div id="loading" class="loader"></div>'
  );
  $("#image_panel").waitForImages(function(){
    $("#loading").remove();
    $("#btn_play").val("Play");
    enableButton("btn_play");
  }, function(loaded, total, success){
    // noop
  },
  true
  );
}

$(document).on("click", "#btn_play", function(evt) {
  disableButton("btn_play");

  // add countdown animation :)
  // also allows images to load
  myCountdown(4, function(){
    if (c.interface == "rsvp") {
      playImagesRsvp(c.samples[c.task].ids);
    } else {
      playImagesTraditional(c.samples[c.task].ids);
    }
  });
});

$(document).on("click", "#btn_next", function(evt) {
  disableButton("btn_next");
  prepareTask();
});

// ------------------------------------------------------------------------------
// Sample and download images

function sampleImages(){
  // TODO does not necessarily account for n_tasks

  // shuffle available other images
  otherSamples = randomPermutation(c.parameters.n_other.value);

  // extract subset that allows task length, n tasks, and n easy/medium/hard to work
  otherSamples = otherSamples.slice(0,
    c.parameters.task_length.value*c.parameters.n_tasks.value - 
      c.parameters.n_easy.value - c.parameters.n_medium.value - c.parameters.n_hard.value);
  otherEasy   = otherSamples.slice(0,
    c.parameters.task_length.value - c.parameters.n_easy.value);
  otherMedium = otherSamples.slice(otherEasy.length,
    otherEasy.length + c.parameters.task_length.value - c.parameters.n_medium.value);
  otherHard   = otherSamples.slice(otherMedium.length,
    otherMedium.length + c.parameters.task_length.value - c.parameters.n_hard.value);

  // set up exact image ids
  c.samples = {
    easy   : {
      positive : randomPermutation(c.parameters.n_easy.value),
      other : otherEasy
    },
    medium : {
      positive : randomPermutation(c.parameters.n_medium.value),
      other : otherMedium
    },
    hard   : {
      positive : randomPermutation(c.parameters.n_hard.value),
      other : otherHard
    }
  };

  c.samples.easy.ids   = createIdsAndShuffle("easy", c.samples.easy.positive, c.samples.easy.other);
  c.samples.medium.ids = createIdsAndShuffle("medium", c.samples.medium.positive, c.samples.medium.other);
  c.samples.hard.ids   = createIdsAndShuffle("hard", c.samples.hard.positive, c.samples.hard.other);
}

function createIdsAndShuffle(task, posSamples, negSamples){
  posIds = [];
  for (let i=0; i<posSamples.length; i++){
    posIds.push("{0}-{1}".format(task, posSamples[i]));
  }
  negIds = [];
  for (let i=0; i<negSamples.length; i++){
    posIds.push("{0}-{1}".format("other", negSamples[i]));
  }
  return _.shuffle(posIds.concat(negIds));
}

function fetchImages(ids){
  for (let i=0; i<ids.length; i++){
    var id = ids[i];
    var tmp = id.split("-");
    var kind = tmp[0];
    var index = tmp[1];
    $( "#image_panel" ).append(
      `<div id="{0}" class="image-hidden bounding-box" style="background-image: url('{1}/{2}/{3}.jpg');"></div>`.format(id, c.data_url, kind, index)
    );
  }
}

// ------------------------------------------------------------------------------
// Experiment logic

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
      setTimeout(cleanUpRsvp, c.parameters.task_t_end.value);
    }
  }, c.parameters.task_length.value, c.parameters.task_t.value);
}

function playImagesTraditional(ids){
  c.playing = true;
  // show first image
  nextIndex = 1;
  showImage(ids[0]);
  // further logic is handled by processKeyTraditional
}

function cleanUpRsvp(){
  c.playing = false;
  flushLog(log);
  clearImages();
  concludeTask();
}

function cleanUpTraditional(){
  c.playing = false;
  flushLog(log);
  clearImages();
  concludeTask();
}

function concludeExperimentation(){
  $("#btn_next").val("Done With Tasks");
  $(document).off("click", "#btn_next").on("click", "#btn_next", function() {
    window.location = "survey.html?uuid=" + c.uuid;
  });
  enableButton("btn_next");
}

/**
 * Called at the end of play. Increments task/interface indices and changes behavior appropriately.
 */
function concludeTask(){
  if (c.task_index == (c.task_list.length - 1)){
    // done with this task.
    if (c.interface_index == (c.interface_list.length - 1)){
      // done with everything.
      concludeExperimentation();
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

function prepareInterface(){

  // interface type
  if (c.interface_index === 0){
    $("#interface_type").text("A");
  } else {
    $("#interface_type").text("B");
  }
  // resample images
  sampleImages();
}

function showImage(id){
  if (lastId){
    $( "#" + lastId).toggle(false);
  }
  $( "#" + id).toggle(true);
  timestamp = Date.now();
  lastId = id;
  pushLog(timestamp, c.uuid, c.interface, c.task, "image", id, "");
}

// ------------------------------------------------------------------------------
// Handle user input

$(document).keypress(function(evt){
  //evt.preventDefault();
  timestamp = Date.now();
  if (c.interface == "rsvp"){
    processKeyRsvp(evt, timestamp);
  } else {
    processKeyTraditional(evt, timestamp);
  }
});

function processKeyRsvp(evt, timestamp){
  if (c.playing){
    value = evt.originalEvent.key;
    if (value == c.keys.positive.character) {
      // flash to indicate key was pressed
      $(".positive-action-reminder").fadeOut(c.reminder_flash_t).fadeIn(c.reminder_flash_t);

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
        showImage(c.samples[c.task].ids[currentIndex]);
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
  if (!c.parameters.testing.value){
    sendRapidCrowdsourcingLog(JSON.stringify(log));
  } else {
    sendRapidCrowdsourcingLogFake(JSON.stringify(log));
  }

  // clear log
  log.length = 0;
}

function clearImages(){
  $( "#image_panel > .bounding-box" ).remove();
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

/**
 * Random permutation of the numbers 0 thru n, exclusive
 */
function randomPermutation(n){
  return _.shuffle(Array.apply(null, {length: n}).map(Number.call, Number));
}

