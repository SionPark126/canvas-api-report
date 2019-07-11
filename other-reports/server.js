const request = require('request-promise')
//const Plotly = require('plotly')
const express = require('express')
const app = express();
var bodyParser = require('body-parser');
const port = 3000;
const path = require('path');
var fs = require('fs');

require('dotenv').config();
const token = process.env.TOKEN
console.log(token)
const sion = process.env.SION
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// const makeAPIRequest = url => request({
//   method: "GET",
//   uri: url,
//   "resolveWithFullResponse": true,
//   "json": true,
//   headers:{
//     "Authorization": " Bearer " + token
//   }
// })

app.use('/', express.static(__dirname +'/public'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/',function (req,res){
  res.sendFile('index.html')
})


//Getting Data from Canvas Account
app.get('/getData', async function (req, res){
    const canvasurl ="https://canvas.spu.edu/api/v1/accounts/1/courses?published=true&per_page=100"
    var data;
    var returnedData = await makeAPIrequest(canvasurl,data);

    var regexName = /^[a-zA-Z0-9]*/g
    var courseInfo = returnedData.map(({ course_code, enrollment_term_id}) => ({ courseName: course_code.match(regexName), termId: enrollment_term_id}));
    console.log(courseInfo);

    var publishedCourse =0;
    var text = "Course Name, Enrollment Term \n"
    for (var i =0; i < courseInfo.length ; i++){
      text += courseInfo[i].courseName + ", "+ courseInfo[i].termId + "\n";
      }

    fs.writeFile('newfile.txt',text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
  res.send(null);
})
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
        var next =new RegExp(/<(.*)>/).exec(response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/)})[0])[1];
        return makeAPIrequest(next, data);
      }
      finished = true;
    //  console.log(data);
      return data;
  }).catch(error =>{
      console.log(error);
      return "error";
  }


  )
};

app.get('/downloadInfo', function (req, res){
    res.download (__dirname+"/newfile.txt", "Information.txt")
})

app.post('/deleteDuplicates', async function (req, res){
  const courseId = req.body.courseId;

  const canvasurl ="https://canvas.spu.edu/api/v1/courses/" +courseId+ "/files?per_page=100";
  var data;
  var returnedData = await makeAPIrequest(canvasurl,data);
  if (returnedData == "error"){
    res.send("Invalid Course Number");
  }
  else{
        var regexName = /^[a-zA-Z0-9]*/g
        var fileInfo = returnedData.map(({ id, updated_at, filename}) => ({ id: id, lastUpdate: updated_at, name: filename}));

        var file = new Object;
        for (var i= 0; i < fileInfo.length; i++){
          if (file[fileInfo[i].name] == undefined){
            file[fileInfo[i].name] = [];
            file[fileInfo[i].name].push(fileInfo[i].lastUpdate);
            file[fileInfo[i].name].push(fileInfo[i].id);
          }
          else if (fileInfo[i].lastUpdate > file[fileInfo[i].name][0]){
            file[fileInfo[i].name].unshift(fileInfo[i].lastUpdate);
            file[fileInfo[i].name].splice(1,0,fileInfo[i].id);

          }
          else{
          //  console.log(fileInfo[i].lastUpdate);
            file[fileInfo[i].name].push(fileInfo[i].lastupdate);
            file[fileInfo[i].name].push(fileInfo[i].id);
          }
        }


        for (var i in file){
          if (file[i].length > 2){
            for (var j = 3; j < file[i].length ; j += 2){
               await deleteFile (file[i][j]);
            }
          }
        }
        res.send("done");
      }
})

function deleteFile(fileId){
  var url ="https://canvas.spu.edu/api/v1/files/"+fileId;
  return request({
    "method": "DELETE",
    "uri": url,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response => {
    console.log(response);
  }).catch(error =>{
    console.log(error);
  })
}
app.get('/listTermIds', async function (req, res){
    const canvasurl ="https://canvas.spu.edu/api/v1/accounts/1/terms?per_page=100"
    var data;
    var returnedData = await makeAPIrequest(canvasurl,data);
    console.log(returnedData[0].enrollment_terms);
    console.log(returnedData[1]);
    var termInfo = returnedData[0].enrollment_terms.map(({ id, name}) => ({ termId: id, termName: name}));
    var text ="";
    for (var i=0; i<termInfo.length; i++){
      text += "Term id: " + termInfo[i].termId + " Term name: " + termInfo[i].termName +" <br>";
    }
    console.log(termInfo);

  res.send(text);
})

app.post('/deleteEmptyCourses', async function (req, res){
  //Wait until the api calls are finished
  req.setTimeout(0);
  var term_id =req.body.termId;
  console.log(term_id);
  var canvasurl ="https://spu.beta.instructure.com/api/v1/accounts/1/courses?with_enrollments=false&published=false&enrollment_term_id" +term_id+ "&per_page=100";
  var data;
    //res.send("wait2");
  console.log("function is called again");
  var returnedData = await makeAPIrequest(canvasurl,data);
  console.log(returnedData);
  if (returnedData == "error"){
    res.send("Invalid term id");
  }
  else{
        var emptyCourses = returnedData.map(({ id, name}) => ({ id: id, name:name}));
        console.log(emptyCourses);
        // for (var i= 0; i < emptyCourses.length; i++){
        //   await deleteCourse(emptyCourses[i].id);
        // }
        res.send("done");
      }
  // res.send("done");
})

app.post('/concludeCourses', async function (req, res){
  //Wait until the api calls are finished
  // var term_id =req.body.termId;
  // console.log(term_id);
  req.setTimeout(0);
  var canvasurl ="https://canvas.spu.edu/api/v1/accounts/22/courses?search_term=UFDN1000L&per_page=100";
  var data;
  var futureTerms = [73,39,40,38];
  var returnedData = await makeAPIrequest(canvasurl,data);
  console.log(returnedData);
  if (returnedData == "error"){
    res.send("Error");
  }
  else{
    var count = 0;
        var courses = returnedData.map(({ id, enrollment_term_id}) => ({ id: id, term:enrollment_term_id}));
        console.log(courses);
        for (var i= 0; i < courses.length; i++){
          if( futureTerms.indexOf(courses[i].term) == -1){
            console.log("correct term" +courses[i].term)
            await concludeCourse(courses[i].id);
          }
        }
        res.send("done");
      }
  // res.send("done");
})

function deleteCourse(courseId){
  var url ="https://spu.beta.instructure.com/api/v1/courses/"+courseId+"?event=delete";
  return request({
    "method": "DELETE",
    "uri": url,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response => {
    console.log(response);
  }).catch(error =>{
    console.log(error);
  })
}

function concludeCourse(courseId){
  var url ="https://canvas.spu.edu/api/v1/courses/"+courseId+"?event=conclude";
  return request({
    "method": "DELETE",
    "uri": url,
    headers:{
      "Authorization": " Bearer " + token
    }
  }).then(response => {
    console.log(response);
  }).catch(error =>{
    console.log(error);
  })
}

app.get('/getCourses', async function (req, res){
    const canvasurl ="https://canvas.spu.edu/api/v1/accounts/1/courses?enrollment_term_id=38&per_page=100"
    var data;
    var returnedData = await makeAPIrequest(canvasurl,data);

    var regexName = /^[a-zA-Z0-9]*/g
    var courseInfo = returnedData.map(({ name, start_at, end_at}) => ({ courseName: name, start_at: start_at, end_at: end_at}));
    //console.log(courseInfo);

    // var publishedCourse =0;
    // var text = "Course Name, Enrollment Term \n"
     for (var i =0; i < courseInfo.length ; i++){
            if (courseInfo[i].end_at != null){
              courseInfo.splice(i,0);
            }
       }
    console.log(courseInfo);

    // fs.writeFile('newfile.txt',text, function (err) {
    //     if (err) throw err;
    //     console.log('File is created successfully.');
    // });
  res.send(courseInfo);
})

app.get('/getComments', async function (req, res){
    const canvasurl ="https://canvas.spu.edu/api/v1/courses/36305/assignments/133897/submissions?include[]=submission_comments&include[]=rubric_assessment&per_page=100&include[]=user"
    var data;
    var returnedData = await makeAPIrequest(canvasurl,data);
// console.log(returnedData);
    var regexName = /^[a-zA-Z0-9]*/g
    var gradeInfo = returnedData.map(({grade, rubric_assessment, submission_comments, user}) => ({ grade:grade, rubric: rubric_assessment, comments: submission_comments, name: user}));

    console.log(gradeInfo)
    var text =""

     for (var i =0; i < gradeInfo.length ; i++){
       text += gradeInfo[i].name.name + "\t" + gradeInfo[i].grade;
       if (gradeInfo[i].rubric != undefined){
         text+= "\t"+ gradeInfo[i].rubric._5846.points +"\t" +gradeInfo[i].rubric._8599.points;
       }
       else{
         text+= "\t" + " " + "\t" +" ";
       }
       var currentComment = "";
       for (var j = 0; j < gradeInfo[i].comments.length; j ++){
         currentComment += gradeInfo[i].comments[j].comment;
         if (j != gradeInfo[i].comments.length-1){
           currentComment +="\n\n";
         }
       }
       currentComment = currentComment.split("\n\n").join("|").split("\n").join("|").split("|");
       if (currentComment){
         for (var j =0; j < currentComment.length; j++){
           text+= "\t" + currentComment[j];
         }
       }
       text += "\n"
     }
    console.log(text)
    fs.writeFile('comments.tsv',text, 'utf8',function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
    res.send("File Created")
})

//     const scores = Promise.all(
//       ids.map(({ assignmentId}) =>
//         makeAPIRequest(`https://canvas.ubc.ca/api/v1/courses/26149/assignments/${assignmentId}?include[]=submission`)
//           .then(submission =>
//             ([
//               JSON.parse(submission).submission.score,
//               assignmentId
//             ])
//           )
//       )
//     ).then(assignmentScores => {
//       const assignmentGroups = Promise.all(
//         ids.map(({ assignmentGroupId }) => makeAPIRequest(`https://canvas.ubc.ca/api/v1/courses/26149/assignment_groups/${assignmentGroupId}`)))
//       .then(groups => {
//         var mygroups=[];
//
//         for (var i =0; i < groups.length; i++){
//           mygroups.push(JSON.parse(groups[i]));
//         }
//         const assignType = mygroups.map(({id, name})=> ({id, groupname: name}));
//         var uniqueId = [];
//         var uniqueName =[];
//         var j = 0;
//         for (var i=0; i< assignType.length; i++){
//           if (uniqueId.indexOf(assignType[i].id) == -1){
//             uniqueId[j]= assignType[i].id
//             uniqueName[j] =assignType[i].groupname
//             j++
//           }
//         }
//         var groupObject = [];
//
//         for (var i=0; i < uniqueId.length; i++){
//
//           var trace = new Object;
//           trace.x =[]
//           trace.y= []
//           //go through ids array to match assignments with group id then pair it with score
//           for (var j=0; j< ids.length; j++){
//             if(uniqueId[i] == ids[j].assignmentGroupId){
//               trace.x.push(ids[j].assignmentName)
//               trace.y.push(assignmentScores[j][0])
//             }
//           }
//
//           trace.name = uniqueName[i];
//           trace.type = 'scatter';
//
//           console.log(trace)
//           dataForGraph.push(trace);
//         }
//         res.send(dataForGraph);
//       })
//     })
//   })
// })
