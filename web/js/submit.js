function sendRapidCrowdsourcingLog(
    dump) {
  var url = "https://sheetsu.com/apis/v1.0/1da100d38704";
  $.post(url, {"dump": dump}, function(data, status, xhr){
    console.log(status);
  });
}

function sendRapidCrowdsourcingLogFake(dump) {}
