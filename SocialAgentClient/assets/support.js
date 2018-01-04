//import Math;

export function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  if(d >= 1.0){
    return Math.round(d) + 'km';
  }else if (d >= 0.001){
    return Math.round(d*1000) + 'm'
  }else{
    return '0km'
  }
}

export function getAgeFromDateOfBirth(dateOfBirth){
  var date = new Date(dateOfBirth);
  var now = new Date();
  var diff =(now.getTime() - date.getTime()) / 1000;
   diff /= (60 * 60 * 24);
  return Math.abs(Math.floor(diff/365.25))
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export function getElapsedTimeFromTimestamp(timestamp){
  const now = new Date();
  const datetime = Date.parse(timestamp);
  const diff = (now - datetime)/1000;
  switch(true){
    case (diff<60):
      return 'Just now'
      break;
    case (diff<3600):
      return Math.floor(diff/60) + ' mins ago';
      break;
    case (diff<86400):
      return Math.floor(diff/3600) + ' hour(s) ago';
      break;
    case (diff<31536000):
      return Math.floor(diff/86400) + ' day(s) ago';
      break;
    default:
      return Math.floor(diff/31536000) + ' year(s) ago';
      break;
  }


}
