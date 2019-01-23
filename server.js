const request = require('request-promise')

const express = require("express");
const http =require("http");
var app = express();
var port = 3000;

var httpServer =http.createServer(app);
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
var url = "https://spu.beta.instructure.com/api/v1/accounts/16/courses?search_term=individual instruction - piano&per_page=100&enrollment_term_id=38"
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
    //  console.log("returned instructor id"+ response.body)
      return response.body[0]
  }).catch(err =>{
    console.log(err)
  });
};

async function sortData(data){
  var instructorIds =[]

    for ( var i =0; i< data.length; i++){
        instructorIds.push(await getInstructors(data[i].courseId));
    }
  //  console.log("Instructor Ids "+ instructorIds);
    return instructorIds
}

//take out course name and CRNs from the string
function crossListing(data){
  console.log("entered")
  console.log(data);
  var regexName = "/(MUS[0-9]{4}/?)+/g"
  var regexCrn = "/([0-9]{5}/?)+/g"
  var courseName ="";
  var crn ="";
  for (var i in data){
    if(data[i].length > 1){
      continue;
    }
    for (var j = 0; j < data[i][j].length; j++){
      courseName += data[i][j].match(regexName);
      crn += data[i][j].match(regexCrn);
      if(j == data[i][j].length-1){
        break;
      }
      courseName += "/";
      crn += "/"
      console.log(courseName);
      console.log(crn);
    }
  }
  return;
}

function createCourse(){
  return request({
    "method": "POST",
    "uri": "https://spu.beta.instructure.com/api/v1/courses/",
    json: true,
    form:{
      "course[name]": "Individual Instruction - piano " + "(" ,
      "course[course_code]": "133"
    },
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response =>{
    //  console.log("returned instructor id"+ response.body)
      return response.body[0]
  }).catch(err =>{
    console.log(err)
  });
}

app.get('/getData', async function (req, res){
      var returneddata = await makeAPIrequest(url);
      const data = returneddata.map(({ id, name }) => ({ courseId: id, courseName: name }))
      console.log(data)

      var sorted = await sortData(data)
;
       console.log(sorted)
      var namingObject = new Object;
      for (var i=0; i< sorted.length; i++){
        if (sorted[i] == undefined){
          continue;
        }
        if (namingObject[sorted[i].name] == undefined){
          namingObject[sorted[i].name] = [];
        }
        namingObject[sorted[i].name].push(data[i].courseName);
      }

      //console.log(namingObject);
      await crossListing(namingObject);

      res.send("completed");
  });

  // app.post('/sortData', function (req, res){
  //
  //         // var data = res;
  //         console.log(req);
  //

  //       res.send(data)
  //   });


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
