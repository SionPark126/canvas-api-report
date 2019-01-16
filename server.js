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
var finished = false;
var url = "https://spu.beta.instructure.com/api/v1/accounts/16/courses?search_term=individual instruction&per_page=100&enrollment_term_id=36&state[]=all"
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

app.get('/getData', async function (req, res){
      var returneddata = await makeAPIrequest(url);
      const newData = returneddata.map(({ id, name }) => ({ courseId: id, courseName: name }))
      if (finished = true){
        for (int i =0; i< data.length(); i++){
          return request({
            "method": "GET",
            "uri": "https://spu.beta.instructure.com/api/v1/courses/"+data.id+"/users?enrollment_type[]=teacher"
            "json": true,
            "resolveWithFullResponse": true,
            headers:{
              "Authorization": " Bearer " + token
            }
          })

      }



      res.send(newData)
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
