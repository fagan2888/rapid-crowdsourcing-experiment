var c = {};
var log = [];
var last_id = "";

$(document).ready(function() {
  initialize();
  ids = fetchImages();
  c.ids = ids; // TODO
});

$(document).on("click", "#btn_play", function(evt) {
  ids = c.ids; // TODO
  playImages(ids);
});

$(document).keypress(function(evt){
  processKey(evt);
});

function initialize(){
  c.playing     = false;
  c.links       = links;
  c.interface   = "rsvp";
  c.task        = "easy";
  c.task_t      = 100; // ms between images
  c.task_length = 100; // number of images in task
  c.task_f_mean = 10;  // mean of number of positive examples to show, per 100
  c.task_f_std  = 2;   // std of number of positive examples to show

  // number of images that are positive examples, per 100
  c.task_f      = randn_bm()*c.task_f_std + c.task_f_mean;

  c.url = "http://web.mit.edu/micahs/www/rsvp/data";

  // user
  c.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
  });
}

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
  c.playing = true;
  var i = 0;
  callNTimes(function() {
    showImage(ids[i]);
    i += 1;
    if (i==c.task_length){
      c.playing = false;
    }
  }, c.task_length, c.task_t);

  // wait until done?
  poll(function(){return !c.playing;}, c.task_length*c.task_t*1.25, c.task_t/2)
  .then(function(){flushLog(log);})
  .catch(function(){console.log("timed out")});
}

function showImage(id){
  if (last_id){
    $( "#" + last_id).removeClass("image-visible").addClass("image-hidden");
  }
  $( "#" + id).removeClass("image-hidden").addClass("image-visible");
  last_id = id;

  timestamp = Date.now();
  log.push({
    "timestamp" : timestamp,
    "uuid"      : c.uuid,
    "interface" : c.interface,
    "task"      : c.task,
    "source"    : "image",
    "id"        : id,
    "value"     : ""
  });
}

function processKey(evt){
  if (c.playing){
    value = evt.which;
    timestamp = Date.now();
    log.push({
      "timestamp" : timestamp,
      "uuid"      : c.uuid,
      "interface" : c.interface,
      "task"      : c.task,
      "source"    : "key",
      "id"        : "",
      "value"     : value
    });
  }
}

function processButton(evt){
  id = evt.target.id;
  timestamp = Date.now();
  log.push({
    "timestamp" : timestamp,
    "uuid"      : c.uuid,
    "interface" : c.interface,
    "task"      : c.task,
    "source"    : "button",
    "id"        : id,
    "value"     : ""
  });
}

function flushLog(log){
  differences = [];
  last = 0;
  for (let i=0; i<log.length; i++){
    row = log[i];

    differences.push(row.timestamp - last);
    last = row.timestamp;

    sendRapidCrowdsourcingLogFake(
      row.timestamp,
      row.uuid,
      row.interface,
      row.task,
      row.source,
      row.id,
      row.value
    );
  }

  // clear log
  console.log(log);
  // log.length = 0;
  //
  console.log(differences);
}

function clearImages(){
  $( "#image_panel > img" ).remove();
}
