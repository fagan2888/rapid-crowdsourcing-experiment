var post_interval = 5000;

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function sendRapidCrowdsourcingLog(dump){
  var url = "https://sheetsu.com/apis/v1.0/1da100d38704";

  // We know that about 256 rows can get through without a problem.
  dump_obj      = JSON.parse(dump);
  post_max_rows = 256;
  n_requests    = Math.floor(dump_obj.length / post_max_rows)+1;

  function myPost(dump_, i){
    setTimeout(function(){
      $.post(url, {"dump": dump_}, function(data, status, xhr){
        console.log("request " + (i+1) + " of " + n_requests + ": " + status);
      });
    },
    post_interval*i);
  }
  for (let i=0; i<n_requests; i++){
    var i_start = i*post_max_rows + 0;
    var i_end   = i*post_max_rows + (post_max_rows-1);
    if (i_end >= dump_obj.length){
      i_end = dump_obj.length-1;
    }
    dump_ =  JSON.stringify(dump_obj.slice(i_start, i_end+1));
    myPost(dump_, i);
  }
}


function sendRapidCrowdsourcingLogFake(dump) {
  console.log(dump);
}
