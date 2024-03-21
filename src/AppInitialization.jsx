import bcrypt from 'bcryptjs';

export const APIPathBase = "https://localhost:7166/api/"  // 172.17.10.69:7251/api/
export const BcryptSalt  = bcrypt.genSaltSync(10)

let dateTime = new Date()

export const UISessionId = "FLAIME_" + 
   dateTime.getFullYear() + '-' + dateTime.getMonth() + "-" + dateTime.getDay() + ' ' +
   dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + 
   dateTime.getSeconds() + '.' + dateTime.getMilliseconds(); 
   
export const AdminUserid = '';   




