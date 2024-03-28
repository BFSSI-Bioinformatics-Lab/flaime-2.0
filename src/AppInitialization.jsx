import bcrypt from 'bcryptjs';
import axios from 'axios';

export const APIPathBase = "https://localhost:7166/api/"  // 172.17.10.69:7251/api/

export const BcryptSalt  = bcrypt.genSaltSync(10)

let dateTime = new Date()

export const UISessionId = "FLAIME_" + 
   dateTime.getFullYear() + '-' + dateTime.getMonth() + "-" + dateTime.getDay() + ' ' +
   dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + 
   dateTime.getSeconds() + '.' + dateTime.getMilliseconds(); 
   
export const AdminUserid = '';   

let temp = encodeURI(bcrypt.genSaltSync(10)).replaceAll('$', 'ZZZ').replace('/', 'FFF');

let _url = APIPathBase + `UpdateBcyptSalt?prmBcryptSalt=` + temp + `&prmBcryptSaltUpdatedBy=greg`;

alert("_url = "+ _url);

axios.put(_url).then(response => {
   alert("in AppInit: response = " + JSON.stringify(response));
});

alert("after updating salt");




