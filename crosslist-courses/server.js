const request = require('request-promise');
const express = require("express");
const http =require("http");
var app = express();
var port = 3000;

//Create Server
var httpServer =http.createServer(app);

//
httpServer.listen(port, function(){
  console.log("server running at http:localhost:3000");
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile("index.html");
})

require('dotenv').config();
const token = process.env.TOKEN
console.log(token)
// const makeAPIRequest = url => request({
//   method: "GET",
//   uri: url,
//   headers:{
//     "Authorization": " Bearer " + token
//   }
// })
var url = "https://spu.beta.instructure.com/api/v1/accounts/16/courses?search_term=individual instruction - &per_page=100&enrollment_term_id=38"
function makeAPIrequest(url, data){
    return request({
      "method": "GET",
      "uri": url,
      "json": true,
      "resolveWithFullResponse": true,
      headers:{
        "Authorization": " Bearer " + token
      }
    }).then(response =>{
      if(! data){
        data =[]
      }
      data = data.concat( response.body);
      console.log(data.length +" answers so far")
      console.log(response.headers.link.includes("next"));

      if ( response.headers.link.includes("next")){
        console.log("there is more");
        var next =new RegExp(/<(.*)>/).exec(response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/) })[0])[1];
        return makeAPIrequest(next, data);
      }
      finished = true;
    //  console.log(data);
      return data;
  })
  //.map(({id, name})=>({courseId: id, courseName: name}))
    // .then(data => data.map(({id, name })=>({courseId: id, courseName: name})))
    // .then(data =>{
    //     console.log(data)


    //wq  }
    // request({
    //   "method": "POST",
    //   "uri": "https://spu.beta.instructure.com/api/v1/courses/"+data.id+"/users?enrollment_type[]=teacher"
    //   "json": true,
    //   "resolveWithFullResponse": true,
    //   headers:{
    //     "Authorization": " Bearer " + token
    //   }


  //  });
};
function getInstructors(courseId){
   return request({
    "method": "GET",
    "uri": "https://spu.beta.instructure.com/api/v1/courses/"+courseId+"/users?enrollment_type[]=teacher",
    "json": true,
    "resolveWithFullResponse": true,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response =>{
    //  console.log(response.body)
     //response.status(204).send();
      return response.body[0]
  }).catch(err =>{
    console.log("Instructor getting error")
    console.log(err)
  });
};

async function sortData(data){
  var instructorIds =[];

    for ( var i =0; i< data.length; i++){
        instructorIds.push(await getInstructors(data[i].courseId));
    }
    console.log(instructorIds);
    return instructorIds;
}

//take out course name and CRNs from the string
async function createCourse(data){
  // console.log(data)

  var regexName = /(MUS[0-9]{4}\/?)+/g
  var regexCrn = /([0-9]{5}\/?)+/g
  var regexInstrument = /-\s?.*?\s\(/g
  var coursesToCrosslist = new Object;
  for (var i in data){
    var courseName ="";
    var crn ="";
    var courseId = "";
    var instrument = "";

    //var instrument = new Set();
    // var sisId ;
    if(data[i].length < 3){
      continue;
    }
    // sisId = i

    for (var j = 0; j < data[i].length; j += 2 ){
      console.log(courseName);
      console.log(typeof data[i][j].match(regexName));
      console.log(data[i][j].match(regexName)[0]);
      if (courseName.includes(data[i][j].match(regexName)[0])){
        console.log("Entered")
        console.log(courseName);
        console.log(data[i][j].match(regexName))
        continue;
      }
      courseName += data[i][j].match(regexName);

      var instrumentSubString;
      //instrument.add(data[i][j].match(regexInstrument));
      crn += data[i][j].match(regexCrn);
      instrumentSubString = data[i][j].match(regexInstrument)[0];
      instrumentSubString = instrumentSubString.substring(2, instrumentSubString.length - 2);


      if(j == parseInt(data[i].length-2)){
        break;
      }
      else{
        courseName += "/";
        crn += "/";
      }

      if (instrument.includes(instrumentSubString))
      {
        continue;
      }
      else if( j==0){
        instrument += instrumentSubString;
      }
      else{
        instrument += "/";
        instrument += instrumentSubString;
      }



    }
    console.log("Final couse name"+ courseName)
    for (var j = 1; j < data[i].length; j += 2 ){
      if(coursesToCrosslist[courseName+"_m"+i+"_"+"201893"] == undefined){
        coursesToCrosslist[courseName+"_m"+i+"_"+"201893"] = [];
      }
      coursesToCrosslist[courseName+"_m"+i+"_"+"201893"].push(data[i][j]);
    }
  //  console.log("CourseName " +courseName);
  //  console.log("CRN " +crn);
  //  console.log("Instrument " +instrument);
    await apiRequestToCreateCourse(instrument, courseName, crn, i);


  }
  console.log(coursesToCrosslist);
  return coursesToCrosslist;
}

function apiRequestToCreateCourse(instrument,courseName, crn, i){
  return request({
    "method": "POST",
    "uri": "https://spu.beta.instructure.com/api/v1/accounts/16/courses",
    json: true,
    form:{
      "course[name]": "Individual Instruction - " + instrument + " (" + courseName + " - " +crn +")",
      "course[course_code]": courseName + "Individual Instruction - " +instrument,
      "course[term_id]": 38,
      "course[sis_course_id]": courseName+"_m"+i+"_"+"201893"
    },
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response =>{
    //  console.log("returned instructor id"+ response.body)
    //response.status(204).send();
  }).catch(err =>{
    console.log("Create Course Error");
    console.log(err)
  });

}

async function getSectionIds(coursesToCrosslist){
  var sectionsToCrosslist = new Object;
  for (var i in coursesToCrosslist){
    for (var j = 0; j<coursesToCrosslist[i].length; j++){
      var sections = [];
      var results;
      results = await getSections(coursesToCrosslist[i][j]);
      console.log(results)
      if(results == undefined){
        continue;
      }
      else{

       for (var k= 0; k< results.length; k++){
          if (sectionsToCrosslist[i] == undefined){
            sectionsToCrosslist[i] = [];
          }
          sectionsToCrosslist[i].push(results[0].sectionId);
        }
      }
    }
  }
  console.log(sectionsToCrosslist)
  return sectionsToCrosslist;

}

function getSections(courseNum){
  console.log(courseNum);
  return request({
    "method": "GET",
    "uri": "https://spu.beta.instructure.com/api/v1/courses/" + courseNum +"/sections",
    json: true,
    "resolveWithFullResponse": true,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response =>{
      if (response.body != []){
        return response.body.map(({id})=>({sectionId: id}))
      }
      return 0;
  }).catch(err =>{
    console.log("Get Sections Error");
    console.log(err)
  });
}

async function crossList(results){
  console.log("Entered to crosslist courses");
  for (var i in results){
    for (var j = 0; j< results[i].length; j++){
      await apiRequestToCrossList(results[i][j], i);
    }
  }

  return 1;

}

function apiRequestToCrossList(section,course){
  course = course.replace(/\//ig,"%2f");
  console.log(course);
  console.log(section);
  return request({
    "method": "POST",
    "uri": "https://spu.beta.instructure.com/api/v1/sections/"+section +"/crosslist/sis_course_id:"+course,
    json: true,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response =>{
  }).catch(err =>{
    console.log("Crosslisting error");
    console.log(err)
  });
}

app.get('/getData', async function (req, res){
      var returneddata = await makeAPIrequest(url);

      const data = returneddata.map(({ id, name }) => ({ courseId: id, courseName: name }))
      //console.log(data)

      var sorted = await sortData(data);

       //console.log(sorted)
      var namingObject = new Object;
      for (var i=0; i< sorted.length; i++){
        if (sorted[i] == undefined){
          continue;
        }
        if (namingObject[sorted[i].sis_user_id] == undefined){
          namingObject[sorted[i].sis_user_id] = [];
        }
        namingObject[sorted[i].sis_user_id].push(data[i].courseName);
        namingObject[sorted[i].sis_user_id].push(data[i].courseId);
      }


       var results =  await createCourse(namingObject);

      var sectionsToCrosslist = await getSectionIds(results);
       console.log(sectionsToCrosslist);
       var done = await crossList(sectionsToCrosslist);

      res.send("completed");
  });



//  console.log("entered")
  // var dataForGraph=[]
  // const courses = makeAPIRequest("https://spu.beta.instructure.com/api/v1/accounts/16/courses?search_term=MUS&per_page=150&enrollment_term_id=36&rel=next")
  // //.then(function(data,response) =>  JSON.parse(data))
  //
  // .then(data => {
  // //  console.log(data)
  //   console.log(courses.headers.response.hea)
    //  console.log(data.headers)
    // while (courses.headers =='next'){
    //   makeAPIRequest("https://spu.beta.instructure.com/api/v1/accounts/16/courses?search_term=MUS&per_page=150&enrollment_term_id=36&rel=next")
    // }
    // const ids = data.map(({ id, name }) => ({ courseId: id, courseName: name }))
    //console.log(courses)

  //res.send("sdf");
  // })
//})



    // const scores = Promise.all(
    //   ids.map(({ assignmentId}) =>
    //     makeAPIRequest(`https://canvas.ubc.ca/api/v1/courses/26149/assignments/${assignmentId}?include[]=submission`)
    //       .then(submission =>
    //         ([
    //           JSON.parse(submission).submission.score,
    //           assignmentId
    //         ])
    //       )
    //   )
