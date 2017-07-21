// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// String format
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// Call a function N times
function callNTimes(func, num, delay) {
     if (!num) return;
     func();
     setTimeout(function() { callNTimes(func, num - 1, delay); }, delay);
}

function myCountdownInner(seconds, callback){
    if (seconds > 0){
      $("#countdown").html(String(seconds));
      $("#countdown").show();
      $("#countdown").fadeOut(1000, function(){
        myCountdownInner(seconds-1, callback);
      });
    } else {
      $("#countdown").remove();
      callback();
    }
}

function myCountdown(seconds, callback){
  $( "#image_panel" ).append(
    '<div id="countdown" class="countdown"></div>'.format(seconds)
  );
  myCountdownInner(seconds, callback);
}

// A short jQuery extension to read query parameters from the URL.
$.extend({
  getUrlVars: function() {
    var vars = [], pair;
    var pairs = window.location.search.substr(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      pair = pairs[i].split("=");
      vars.push(pair[0]);
      vars[pair[0]] = pair[1] &&
          decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
    return vars;
  },
  getUrlVar: function(name) {
    return $.getUrlVars()[name];
  }
});
