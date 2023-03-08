const path = require("path");
const express = require("express");
const app = express();
const moment = require("moment");
const bodyParser = require("body-parser");
var unirest = require("unirest");
app.use(bodyParser.json());
var axios = require("axios");
require("moment/locale/es");
const cors = require("cors");
const multer = require("multer");

const dbConn = require("./config/db.config");
const request = require("request");
app.use(cors());

const port = process.env.PORT || 3000;

const {
  TokenZoho,
  GetTemplates,
  ValidateLeadZoho,
  ValidateContactZoho,
  ValidateCliente,
  ValidateNumeroAsesor,
  CreateMessageZoho,
  CrearCliente,
  CreateLeadZoho,
  ValidarChat,
  CrearChat,
  ValidarBot,
  createMessage,
  EnviarMessageBot,
  createMessageBot,
  CreateMessageZohoBot,
  ValidateCelsZoho,
  GetMessages,
  EnviarMessageAsesor,
  createMessageAsesor,
  CreateMessageZohoAsesor,
  CrearChatAsesor,
  ValidateCelsClients
} = require("./Funciones");

const server = app.listen(port, () => {
  console.log(`hola`);
  console.log(path.join(__dirname, "public"));
});

const SocketIO = require("socket.io");
const { log } = require("console");
const io = SocketIO(server);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

// -------------------- Funcion de crear token zoho --------------------

app.get("/GetToken", async (req, res) => {
  console.log("token");
  let Token = await TokenZoho();
  console.log(Token);
  res.json(Token);
});

// -------------------- Funcion para traer las plantillas --------------------

app.post("/GetTemplates", async (req, res) => {
  let ArrayTemplates = await GetTemplates();
  //console.log(ArrayTemplates);
  res.json(ArrayTemplates);
});

// -------------- Funcion de traer celulares y usuarios ----------------
async function GetUsersCels(accessToken, UserLogin) {

  let config = {
    method: "get",
    url: "https://www.zohoapis.com/crm/v4/Numeros_de_Celular?fields=Usuarios&per_page=200",
    headers: {
      Authorization: "Zoho-oauthtoken " + accessToken + "",
      Cookie:
        "1a99390653=38cb8ea2263325867ee4c30d7be7e27e; JSESSIONID=BAFCE359F17C0DC88D2446C2ABABC3B3; _zcsr_tmp=7b34d5a5-83b9-4b5e-93a6-3cafe9d29c2e; crmcsr=7b34d5a5-83b9-4b5e-93a6-3cafe9d29c2e",
    },
  };

  let Data = await axios(config);

  let ArrayData = Data.data.data;
  let ArrayNumeros = [];

  for (const item of ArrayData) {
    let config = {
      method: "get",
      url:
        "https://www.zohoapis.com/crm/v4/Numeros_de_Celular/" +
        item.id +
        "?fields=Usuarios,Numero_de_Celular&per_page=200",
      headers: {
        Authorization: "Zoho-oauthtoken " + accessToken + "",
        Cookie:
          "1a99390653=38cb8ea2263325867ee4c30d7be7e27e; JSESSIONID=BAFCE359F17C0DC88D2446C2ABABC3B3; _zcsr_tmp=7b34d5a5-83b9-4b5e-93a6-3cafe9d29c2e; crmcsr=7b34d5a5-83b9-4b5e-93a6-3cafe9d29c2e",
      },
    };

    let Data2 = await axios(config);
    let numer_cel = Data2.data.data[0].Numero_de_Celular;
    let UsersArray = Data2.data.data[0].Usuarios;

    let aro = UsersArray.some((numeros) => numeros.Usuarios.id == UserLogin);

    if (aro) ArrayNumeros.push(numer_cel);
  }

  return ArrayNumeros;
}

app.post("/GetUsersCels", async (req, res) => {
  let DataUsersCels = await GetUsersCels(req.body.Token, req.body.UserLogin);
  // console.log("********");
  // console.log(DataUsersCels);
  res.json(DataUsersCels);
});

// -------------- Funcion para validar los chats y numeros del cliente ------------------------

app.post("/ValidateCels", async (req, res) => {

  let NumeroTelefonoZoho = req.body.NumeroTelefonoZoho;

  let DataCels = await ValidateCelsZoho(NumeroTelefonoZoho);
  //console.log(DataCels);
  res.json(DataCels);

});

// -------------- Funcion para validar los chats y numeros del cliente ------------------------

app.post("/GetMessges", async (req, res) => {

  let id_chat = req.body.id_chat;

  let DataMessages = await GetMessages(id_chat);
  res.json(DataMessages);

});

// -------------- Funcion para crear cliente si no hay y validar cel ------------------------

app.post("/ValidateCelsClients", async (req, res) => {

  let NumeroAsesesor = req.body.NumeroAsesesor;
  let NumeroCliente = req.body.NumeroCliente;

  let DataCel = await ValidateCelsClients(NumeroAsesesor,NumeroCliente);
  console.log("Data - ValidateCelsClients")
  console.log(DataCel);
  res.json(DataCel);

});

// -------------- Funcion para crear chats ------------------------

app.post("/CrearChatAsesor", async (req, res) => {

  let NumeroAsesesor = req.body.NumeroAsesesor;
  let NumeroCliente = req.body.NumeroCliente;

  let DataChat = await CrearChatAsesor(NumeroAsesesor,NumeroCliente);
  res.json(DataChat);

});


// -----------------------------------------------------------------------------------------

io.on("connection", (socket) => {

  socket.on("chat:MessageSend", (data) => {

    console.log("Enviamos Mensaje asesor");

    console.log("-----------------");
    console.log(data);
    console.log("-----------------");

    const {

      Menssage,
      FechaHora,
      IdChat,
      IdAsesor,
      NumeroCliente,
      NumeroAsesor,
      NumeroSelect,
      IdNumeroCelular,
      tipoMensaje

    } = data;

    const type_msj = "text";

    const numcel_zoho = "+" + NumeroCliente;
    const numcel_zoho_url = encodeURIComponent(numcel_zoho);

    console.log(numcel_zoho)
    console.log("aca voy a mandar el mensaje a la vista ---->");
    io.sockets.emit("chat:MessageSend", data);

    // ---------------------------------------------------



    TokenZoho().then(async (TokenZoho) => {

      console.log("Token zoho: ", TokenZoho)

      Promise.all([
        ValidateLeadZoho(TokenZoho, numcel_zoho_url),
        ValidateContactZoho(TokenZoho, numcel_zoho_url),
      ]).then(async ([DataLead, DataContact]) => {
  
        let id_client_zoho;
        let client_tipo;
  
        if (DataLead.ok && !DataContact.ok) {
          id_client_zoho = DataLead.id_client_zoho;
          client_tipo = "Lead";
          console.log("¡Datos de zoho encontrados en lead!");
        }else if (!DataLead.ok && DataContact.ok) {
          id_client_zoho = DataContact.id_client_zoho;
          client_tipo = "Contact";
          console.log("¡Datos de zoho encontrados en contact!");
        }else if(!DataLead.ok && !DataContact.ok){
          console.log("¡Datos de zoho no encontrados!");
          id_client_zoho = (await CreateLeadZoho(TokenZoho,Name_client, num_cel)).id_client_zoho;
          client_tipo = "Lead";
        }else{
          console.log("¡Datos de zoho duplicados!");
          id_client_zoho = DataContact.id_client_zoho;
          client_tipo = "Duplicado";
        }


        EnviarMessageAsesor(Menssage,NumeroCliente,IdNumeroCelular,tipoMensaje).then( async (ResponseMessageAsesor) => {

          //console.log(ResponseMessageAsesor);

          const { IdMensajeAsesor } = ResponseMessageAsesor;

          createMessageAsesor({

            Menssage,
            FechaHora,
            IdAsesor,
            IdMensajeAsesor,
            type_msj,
            IdChat

          }).then(async (ResponseMessageAsesor) => {

            //console.log(ResponseMessageAsesor);

            
            CreateMessageZohoAsesor({TokenZoho,client_tipo,id_client_zoho,Menssage,FechaHora,NumeroSelect}).then(async (ResponseMessageZohoBot) => {

              console.log(ResponseMessageZohoBot);

            })
            
          });
          


        })

      });

    });
  


  




    /*
    dbConn.query(
      "SELECT * FROM tbl_usuarios WHERE wpp_numero = '" +
        numclien +
        "' and wpp_reinicio >= 1 LIMIT 1 ",
      function (err, res) {
        console.log("****************");
        console.log(res.length);

        if (res.length > 0) {
          function diff_minutes(fechaYHora, fecha_msm) {
            console.log("fecha de ya: " + fechaYHora);
            console.log("fecha de msj usuario: " + fecha_msm);

            const fecha_base_datos2 = moment(fecha_msm, "YYYY-MM-DD hh:mm:ss");
            const fechaYHora2 = moment(fechaYHora, "YYYY-MM-DD hh:mm:ss");
            const differenceInMinutes = moment(fechaYHora2).diff(
              fecha_base_datos2,
              "minutes"
            );

            console.log("Pasaron: -> ", differenceInMinutes, " minutes");
            return differenceInMinutes;
          }

          var fecha_msm = res[0].wpp_fecha_hora;
          fecha_msm = moment(fecha_msm).format("YYYY-MM-DD HH:mm:ss");

          var diferencia_min = diff_minutes(fechaYHora, fecha_msm);

          diferencia_min = diferencia_min + " min";
          console.log(diferencia_min);

          dbConn.query(
            "UPDATE tbl_usuarios SET tiempo_wpp = '" +
              diferencia_min +
              "' ,wpp_ascesor = '" +
              nombre_asesor +
              "', wpp_estado = 'Atendido' , wpp_reinicio = 0 WHERE wpp_numero = '" +
              numclien +
              "'"
          );
        } else {
          console.log("solo actualice el atendido");

          dbConn.query(
            "UPDATE tbl_usuarios SET wpp_estado = 'Atendido',wpp_ascesor = '" +
              nombre_asesor +
              "' , wpp_reinicio = 0 WHERE wpp_numero = '" +
              numclien +
              "'"
          );
        }
      }
    );
    */



  });

  socket.on("chat:message_imagen", (data) => {
    console.log("entre a donde no sabemos 2");

    var numcliente = data.numclien;
    var idcliente = data.idcliente;
    var numbreimagen = data.numbreimagen;

    app.post("/files", uppload.single("avatar"), (req, res) => {
      //res.send("Carga perfecta");
      //console.log(uppload.single('avatar'));

      console.log("entre a donde no sabemos 3");

      var mensewp =
        "https://addapptech.com/wppvisiontecnoimajenesmandar/" + nombre_imagen; //+nombre_imagen;
      var datamandar = {
        idcliente: idcliente,
        numclien: numcliente,
        imagenmanda: mensewp,
        numbreimagen: numbreimagen,
      };

      console.log(datamandar);

      io.sockets.emit("chat:message_imagen", datamandar);
      if (
        numbreimagen == null ||
        numbreimagen == "" ||
        numbreimagen == undefined
      ) {
        console.log(access_token);
        unirest
          .post("https://www.zohoapis.com/crm/v2/mensajes_wpp")
          .header("Accept", "application/json")
          .header("Authorization", "Zoho-oauthtoken " + access_token)
          .send(
            '{"data": [{"mensaje":"' +
              mensewp +
              '","Owner": "4843088000000304001","numero_cliente":"' +
              "cel" +
              numcliente +
              '","responde":true,"Posible_Cliente":"' +
              idcliente +
              '","fecha_hora_wpp":"' +
              fechHo +
              '","Imagen":true}]}'
          )
          .end(function (response) {
            console.log("hoooooooooooooooooooooooolaaaaaaaaaaaaaaaaaaaaaaaa");
            console.log(response.body);
          });
      } else {
        console.log(access_token);
        unirest
          .post("https://www.zohoapis.com/crm/v2/mensajes_wpp")
          .header("Accept", "application/json")
          .header("Authorization", "Zoho-oauthtoken " + access_token)
          .send(
            '{"data": [{"mensaje":"' +
              mensewp +
              '","Owner": "4843088000000304001","numero_cliente":"' +
              "cel" +
              numcliente +
              '","responde":true,"Posible_Cliente":"' +
              idcliente +
              '","fecha_hora_wpp":"' +
              fechHo +
              '","Imagen":true,"Mensaje_Imagen":' +
              numbreimagen +
              "}]}"
          )
          .end(function (response) {
            console.log("hoooooooooooooooooooooooolaaaaaaaaaaaaaaaaaaaaaaaa");
            console.log(response.body);
          });
      }

      client.messages
        .create({
          from: "whatsapp:+19548335003",
          body: numbreimagen,
          mediaUrl: mensewp,
          to: "whatsapp:" + numcliente,
        })
        .then((message) => console.log("message"));
    });
  });
});

// -----------------------------------------------------------------------------------------

// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {
//         cb(null, './public/imajenesmandar')
//     },
//     filename: function (req, file, cb) {
//         const ext = file.originalname.split('.').pop()
//         cb(null, `${Date.now()}.${ext}`)
//     }

// });

// const upload = multer({ storage });

app.post("/webhooks", (req, res) => {
  let tipo_webhook = req.body.entry[0].changes[0].value.statuses;

  if (tipo_webhook == undefined) {
    let type_msj = req.body.entry[0].changes[0].value.messages[0].type;
    let mime_type;
    let id_multimedia;
    let url_multimedia;
    let Mensaje_client;

    if (type_msj == "button") {
      Mensaje_client =
        req.body.entry[0].changes[0].value.messages[0].button.text;
    } else if (type_msj == "text") {
      Mensaje_client = req.body.entry[0].changes[0].value.messages[0].text.body;
    } else if (type_msj == "audio") {
      Mensaje_client = "<- Es multimedia (audio) ->";
      mime_type =
        req.body.entry[0].changes[0].value.messages[0].audio.mime_type;
      id_multimedia = req.body.entry[0].changes[0].value.messages[0].audio.id;
      url_multimedia = "";
    } else if (type_msj == "image") {
      Mensaje_client = "<- Es multimedia (image) ->";
      mime_type =
        req.body.entry[0].changes[0].value.messages[0].image.mime_type;
      id_multimedia = req.body.entry[0].changes[0].value.messages[0].image.id;
      url_multimedia = "";
    } else if (type_msj == "document") {
      Mensaje_client = "<- Es multimedia (document) ->";
      mime_type =
        req.body.entry[0].changes[0].value.messages[0].document.mime_type;
      id_multimedia =
        req.body.entry[0].changes[0].value.messages[0].document.id;
      url_multimedia = "";
    } else if (type_msj == "video") {
      Mensaje_client = "<- Es multimedia (video) ->";
      mime_type =
        req.body.entry[0].changes[0].value.messages[0].video.mime_type;
      id_multimedia = req.body.entry[0].changes[0].value.messages[0].video.id;
      url_multimedia = "";
    }

    const celular_asesor =
      req.body.entry[0].changes[0].value.metadata.display_phone_number;
    const id_celular_asesor =
      req.body.entry[0].changes[0].value.metadata.phone_number_id;
    const num_cel = req.body.entry[0].changes[0].value.contacts[0].wa_id;
    const Name_client =
      req.body.entry[0].changes[0].value.contacts[0].profile.name;
    const id_mensaje = req.body.entry[0].changes[0].value.messages[0].id;
    const hora_msj_unix =
      req.body.entry[0].changes[0].value.messages[0].timestamp;
    const numcel_zoho = "+" + num_cel;
    const numcel_zoho_url = encodeURIComponent(numcel_zoho);

    let fecha_msj = moment.unix(hora_msj_unix);
    const hora_actula2 = fecha_msj.format("HH:mm");
    const fechaYHora = fecha_msj.format("YYYY-MM-DD HH:mm:ss");

    console.log("== INGRESO MENSAJE ==");
    console.log("---> " + fechaYHora);
    console.log("tipo --> " + type_msj);
    console.log("Mensaje --> " + Mensaje_client);
    console.log("Nombre --> " + Name_client);
    console.log("# celular: " + num_cel);
    console.log("# asesor: " + celular_asesor);
    console.log("=====================");


    /**
     * Hacemos envio de los sockets
     */

    
    if (type_msj == "image" || type_msj == "video" || type_msj == "audio") {
      var options = {
        method: "GET",
        url: "https://graph.facebook.com/v15.0/" + id_multimedia + "",
        headers: {
          Authorization: whpp_key,
        },
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);

        var json_aro = JSON.parse(response.body);
        var fs = require("fs");
        var url_imag = "" + json_aro.url + "";

        console.log("===========================");
        console.log(url_imag);
        console.log("==========================");

        let unix_ya = Date.now();

        const config = {
          method: "get",
          url: url_imag,
          headers: {
            Authorization: whpp_key,
          },
          responseType: "arraybuffer",
        };
        axios(config)
          .then(function (response) {
            const ext = response.headers["content-type"].split("/")[1];
            fs.writeFileSync(
              `./public/imajenesmandar/${unix_ya}.${ext}`,
              response.data
            );
            id_unix_multi = unix_ya + "." + ext;

            console.log("================> " + id_unix_multi);

            var datajs = {
              mensaje: Mensaje_client,
              numclien: num_cel,
              tipomensaje: type_msj,
              id_multimedia: id_unix_multi,
            };

            console.log("------------------- aca envio el socket ----------");
            console.log(datajs);

            io.sockets.emit("chat:message777", datajs);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    } else {

      var datajs = {
        mensaje: Mensaje_client,
        numclien: num_cel,
        tipomensaje: type_msj,
        id_multimedia: id_multimedia,
        numasesor: celular_asesor
      };

      console.log("<--- aca envio el socket -->");

      io.sockets.emit("chat:MessageReceived", datajs);
    }
    

    TokenZoho().then(async (TokenZoho) => {

      Promise.all([
        ValidateLeadZoho(TokenZoho, numcel_zoho_url),
        ValidateContactZoho(TokenZoho, numcel_zoho_url),
      ]).then(async ([DataLead, DataContact]) => {

        let id_client_zoho;
        let client_tipo;

        if (DataLead.ok && !DataContact.ok) {
          id_client_zoho = DataLead.id_client_zoho;
          client_tipo = "Lead";
          console.log("¡Lead!");
        }else if (!DataLead.ok && DataContact.ok) {
          id_client_zoho = DataContact.id_client_zoho;
          client_tipo = "Contact";
          console.log("¡Contact!");
        }else if(!DataLead.ok && !DataContact.ok){
          console.log("¡Datos de zoho no encontrados!");
          id_client_zoho = (await CreateLeadZoho(TokenZoho,Name_client, num_cel)).id_client_zoho;
          client_tipo = "Lead";
        }else{
          console.log("¡Datos de zoho duplicados!");
          id_client_zoho = DataContact.id_client_zoho;
          client_tipo = "Duplicado";
        }

        Promise.all([
          ValidateCliente(num_cel),
          ValidateNumeroAsesor(celular_asesor),
          CreateMessageZoho({TokenZoho,client_tipo,id_client_zoho,Mensaje_client,fechaYHora,num_cel})
        ]).then(async ([DataCliente, DataNumAsesor, DataMessgeZoho]) => {

          const id_cliente = DataCliente.id_cliente || (await CrearCliente(Name_client, num_cel,id_client_zoho,client_tipo)).id_cliente;

          if (!DataNumAsesor.ok) console.log("No se encontro el numero");
          const { id_celular } = DataNumAsesor;

          ValidarChat(id_cliente,id_celular).then(async (DataChat) => {

            const id_chat = DataChat.id_chat || (await CrearChat(id_cliente,id_celular)).id_chat;

            ValidarBot(fechaYHora,Mensaje_client,id_chat).then(async (DataBot) => {

              let { wpp_error,wpp_fuera_hora,whpp_msj_correo } = DataBot.msgInfo;
              let wpp_id_asesor = null;
              let { TipoRespuesta } = DataBot;

              console.log("***********************")
              console.log(TipoRespuesta);

              createMessage({

                Mensaje_client,
                fechaYHora,
                wpp_id_asesor,
                wpp_error,
                wpp_fuera_hora,
                id_mensaje,
                hora_msj_unix,
                whpp_msj_correo,
                type_msj,
                mime_type,
                id_multimedia,
                id_chat

              }).then(async (ResponseMessage) => {


                if (ResponseMessage.ok && TipoRespuesta) {

                  EnviarMessageBot(TipoRespuesta,num_cel,id_celular_asesor).then( async (ResponseMessageBot) => {

                    console.log("----------------- || -------------")
                    console.log(ResponseMessageBot)

                    const { IdMensajeBot, MensajeBot } = ResponseMessageBot;

                    let fechaYhoraBot = moment().format('YYYY-MM-DD HH:mm:ss')
                    let wpp_id_asesor = 0;


                    let FechaHora = fechaYhoraBot;
                    let Menssage = MensajeBot;
                    let NumeroCliente = num_cel;
                    let NumeroSelect = celular_asesor; 

                    io.sockets.emit("chat:MessageSend", {FechaHora,Menssage,NumeroCliente,NumeroSelect});

                    createMessageBot({

                      MensajeBot,
                      fechaYhoraBot,
                      wpp_id_asesor,
                      wpp_error,
                      wpp_fuera_hora,
                      IdMensajeBot,
                      hora_msj_unix,
                      whpp_msj_correo,
                      type_msj,
                      mime_type,
                      id_multimedia,
                      id_chat
      
                    }).then(async (ResponseMessageBot) => {

                      console.log(ResponseMessageBot);

                      CreateMessageZohoBot({TokenZoho,client_tipo,id_client_zoho,MensajeBot,fechaYhoraBot,celular_asesor}).then(async (ResponseMessageZohoBot) => {

                        

                        console.log(ResponseMessageZohoBot);

                      })

                    });

                  })
                  
                }else{
                  console.log("Esta con asesor..")
                }

              })


            })


          })

        })



      });
    });


  } else {
    /*
        console.log("===================")
        console.log("Esto es una actualizacion de estado")

        var estado_msj = req.body.entry[0].changes[0].value.statuses[0].status;
        var id_msj = req.body.entry[0].changes[0].value.statuses[0].id;

        console.log("ID mensaje: ", id_msj)
        console.log("ESTADO mensaje: " + estado_msj)
        */
  }

  res.sendStatus(200);
});

// ------------------------------------------------------------------------------------------

app.get("/webhooks", (req, res) => {
  console.log(req.query);

  let challenge = req.query["hub.challenge"];

  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == "testtoken"
  ) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(400);
  }

  res.sendStatus(200);
});


//archivos estaticos que van al navegador
app.use(express.static(path.join(__dirname, "public")));
