const Http = new XMLHttpRequest();
const url='https://canvas.instructure.com/api/v1/courses/';
Http.open("GET", url);
Http.send();
Http.setReqestHeader({
  "Content-Type": "application/json",
	"Authorization": "6211~UhALRSFjCu1Do3ZfMFKIziIONkxD6XDG87TBvkWkPjonud7SIu8037RX9f3d5UIO"

})
Http.onreadystatechange = function ReceivedCallback(e){
  if ( this.readyState == 4 & this.status ==200){
    console.log(Http.responseText);
  }

}
