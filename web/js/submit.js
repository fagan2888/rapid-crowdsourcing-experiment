function sendRapidCrowdsourcingLog(
    timestamp,
    uuid,
    interface_,
    task,
    source,
    id,
    value) {
  var formid = "e/1FAIpQLSev6MhPFX615bg20WlcY6TylTiX5rRyZnZ5PM6CDVvHlVpBQA";
  var data = {
    "entry.680859546": timestamp,
    "entry.1579243647": uuid,
    "entry.2090233948": task,
    "entry.5001241": source,
    "entry.1272031500": id,
    "entry.118946665": value
  };
  var params = [];
  for (var key in data) {
    params.push(key + "=" + encodeURIComponent(data[key]));
  }
  // Submit the form using an image to avoid CORS warnings.
  (new Image()).src = "https://docs.google.com/forms/d/" + formid +
     "/formResponse?" + params.join("&");
}

function sendRapidCrowdsourcingLogFake(
    timestamp,
    uuid,
    interface_,
    task,
    source,
    id,
    value) {
}
