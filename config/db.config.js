'user strict';

const mysql = require('mysql');

//local mysql db connection
const dbConn = mysql.createConnection({
  host     : 'crm.activecloud.online',
  user     : 'root2',
  password : 'Activegroup135*.',
  port     : '',
  database : 'Whatsapp_Vision_Tecno'
});
dbConn.connect(function(err) {
  if (err) throw err;
  console.log("¡Database Connected!");
});
//consultas sql

module.exports = dbConn;

/*
Base de datos: vtbasededatos
Nombre de usuario: visiontecno
Correo electrónico: dmonsalve@visiontecno.com
password : bdc96c37
Alvaro martin 
*/