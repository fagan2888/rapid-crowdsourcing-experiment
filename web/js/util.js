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

// The polling function
function poll(fn, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;

    var checkCondition = function(resolve, reject) {
        // If the condition is met, we're done! 
        var result = fn();
        if(result) {
            resolve(result);
        }
        // If the condition isn't met but the timeout hasn't elapsed, go again
        else if (Number(new Date()) < endTime) {
            setTimeout(checkCondition, interval, resolve, reject);
        }
        // Didn't match and too much time, reject!
        else {
            reject(new Error('timed out for ' + fn + ': ' + arguments));
        }
    };

    return new Promise(checkCondition);
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
