


function getCourses(){

  var courses;
  const Http = new XMLHttpRequest();
  const url='/getData';
  Http.open("GET", url);
  Http.send();
  // Http.setReqestHeader({
  //   "Content-Type": "application/json",
  // 	"Authorization": "6211~UhALRSFjCu1Do3ZfMFKIziIONkxD6XDG87TBvkWkPjonud7SIu8037RX9f3d5UIO"
  //
  // })
  Http.onreadystatechange = function ReceivedCallback(e){
    if ( this.readyState == 4 & this.status ==200){
      courses = JSON.parse(this.responseText);
  //    console.log("hi")
    //  console.log(this.headers)
    }
  }


  var arrayCourses = []
  // courses[0] = courses[0].
  // for (var i=0; i <courses.length -1 ; i++){
  //   var courseName = courses[i].courseName;
  //   var nextName = courses[i+1].courseName;
  //   var index= courses[i].courseName.indexOf("(");
  //   if (courseName.substring(courseName[index]+4, courseName[index+7]) == nextName.substring(nextName[index]+4, nextName[index]+7)){
  //
  //   }
//}

}


// var data = canvasInfo;
// console.log(data)
// function submit(){
//
//   $("#result").text(" ");
//   var variable = $("#options")[0].value;
//   console.log(variable)
//   if (variable =="courseNum"){
//     $("#result").text(data.length);
//   }
//   else if(variable == "names"){
//     var text = "";
//     for (var i =0; i <data.length ;i++){
//       text += data[i].name + '\n' ;
//     }
//
//     $("#result").text(text);
//   }
// }
