// const Https = new XMLHttpRequest();
// const url='https//canvas.instructure.com/api/v1/courses/';
//
//
// Https.onreadystatechange = function ReceivedCallback(e){
//   if ( this.readyState == 4 & this.status ==200){
//     console.log(Http.responseText);
//   }
// }
// Https.open("GET", url);
// Https.setRequestHeader("Content-Type", "application/json");
// Https.setRequestHeader("Authorization", "Bearer 6211~UhALRSFjCu1Do3ZfMFKIziIONkxD6XDG87TBvkWkPjonud7SIu8037RX9f3d5UIO");
// Https.setRequestHeader("Access-Control-Allow-Credentials", true);
// Https.setRequestHeader("Access-Control-Allow-Origin", true)
// Https.send();

var extractedData = JSON.stringify(canvasInfo);
var data = JSON.parse(extractedData);
console.log(data[0].course_code);
console.log(data.length); //course numbers in account
//course name ==> name
//
function submit(){
$("#result").text("");
var variable = document.getElementById("options").value;
console.log(variable);
if (variable =="courseNum"){
  $("#result").text(data.length);
}
else if (variable =="names"){
  var text ="";
  for (var i =0; i< data.length; i++){
    text +=  data[i].name ;
    text += "\n";
  }
  console.log(text);
  $("#result").text(text);
}
}
