// const Http = new XMLHttpRequest();
// const url='https://canvas.instructure.com/api/v1/courses/';
// Http.open("GET", url);
// Http.send();
// Http.setReqestHeader({
//   "Content-Type": "application/json",
// 	"Authorization": "6211~UhALRSFjCu1Do3ZfMFKIziIONkxD6XDG87TBvkWkPjonud7SIu8037RX9f3d5UIO"
//
// })
// Http.onreadystatechange = function ReceivedCallback(e){
//   if ( this.readyState == 4 & this.status ==200){
//     console.log(Http.responseText);
//   }
//
// }
var data = canvasInfo;
console.log(data)
function submit(){

  $("#result").text(" ");
  var variable = $("#options")[0].value;
  console.log(variable)
  if (variable =="courseNum"){
    $("#result").text(data.length);
  }
  else if(variable == "names"){
    var text = "";
    for (var i =0; i <data.length ;i++){
      text += data[i].name + '\n' ;
    }

    $("#result").text(text);
  }
}
