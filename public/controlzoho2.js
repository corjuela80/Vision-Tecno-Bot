/**
 * Funciones
 */

function mensageasesor(data) {
  var mensage = data.mensaje;
  var fecha_hora_wpp = data.fechahora;

  var numcliente = $("#idnumerocliente").val();
  var idcliente = $("#idcliente").val();
  var nameEntity = localStorage.getItem("moduloabierto");

  console.log(numcliente);
  console.log(nameEntity);
  if (nameEntity == "Leads") {
    var recordData = {
      mensaje: mensage,
      numero_cliente: numcliente,
      responde: true,
      //"Name": numcliente,
      fecha_hora_wpp: fecha_hora_wpp,
      Posible_Cliente: idcliente,
    };
  } else {
    var recordData = {
      mensaje: mensage,
      numero_cliente: numcliente,
      responde: true,
      //"Name": numcliente,
      fecha_hora_wpp: fecha_hora_wpp,
      Cliente: idcliente,
    };
  }
  console.log(recordData);
  ZOHO.CRM.API.insertRecord({
    Entity: "mensajes_wpp",
    APIData: recordData,
    Trigger: ["workflow"],
  }).then(function (data) {
    console.log(data);
  });
}

function mensagecliente(data) {
  var idcliente = $("#idcliente").val();
  var nameEntity = $("#nameEntity").val();
  //{"mensaje":data,"fechahora":fechHo}
  var mensage = data.mensaje;
  var fecha_hora_wpp = data.fechahora;
  var numcliente = data.numclien;
  console.log(numcliente);
  if (nameEntity == "Leads") {
    var recordData = {
      mensaje: mensage,
      numero_cliente: "cel" + numcliente,
      responde: false,
      Owner: "4843088000000304001",
      //"Name": numcliente,
      fecha_hora_wpp: fecha_hora_wpp,
      Posible_Cliente: idcliente,
    };
  } else {
    var recordData = {
      mensaje: mensage,
      numero_cliente: "cel" + numcliente,
      responde: false,
      Owner: "4843088000000304001",
      //"Name": numcliente,
      fecha_hora_wpp: fecha_hora_wpp,
      Cliente: idcliente,
    };
  }

  ZOHO.CRM.API.insertRecord({
    Entity: "mensajes_wpp",
    APIData: recordData,
    Trigger: ["workflow"],
  }).then(function (data) {
    console.log(data);

    $("#headerorder").append(
      `<input id="respuesta" value = "${data.data[0].code}"></input>`
    );
  });
  var respuesta = "GUARDADO_DESDE_WI";
  return respuesta;
}


/**
 * ---------------------------------------------------------------------
 */

/**
 * Codigo
 */

ZOHO.embeddedApp.on("PageLoad", function (data) {
  const ModuloZoho = data.Entity;
  const IdRegistroZoho = data.EntityId[0];

  ZOHO.CRM.API.getRecord({ Entity: ModuloZoho, RecordID: IdRegistroZoho }).then(
    function (data) {

      let NumeroTelefonoZoho = data.data[0].Mobile;

      $("#NumeroCelularRegistro").val(NumeroTelefonoZoho.replace("+",""));

      

      if (NumeroTelefonoZoho) {
        NumeroTelefonoZoho = NumeroTelefonoZoho.replace("+","")
      }else{

        console.log("No hay numero registro");

      }

      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {

        let IdLoginUser = data.users[0].id;

        TokenZoho().then(async (ResponseToken) => {

          console.log("Token zoho: ", ResponseToken);

          ListarPlantillas();

          getUsersCels(ResponseToken, IdLoginUser).then(
            async (ResponseCelsZoho) => {

              console.log("<Numeros de acceso del usuario>")
              console.log(ResponseCelsZoho);

              if(ResponseCelsZoho.length > 0){

                ValidarChats(NumeroTelefonoZoho, ResponseCelsZoho, IdLoginUser).then( async (ResponseValidarChats) => {

                  console.log(ResponseValidarChats);
  
                  let { ArraySelect } = ResponseValidarChats

                  console.log(ArraySelect);

                  
  
                  if (ArraySelect.length > 0) {
                    
                    ListarNumeros(ArraySelect);

                    if (ArraySelect[0].id_chat != null) {
                      
                      let idCatSelect = ArraySelect[0].id_chat;
  
                      ListarChats(idCatSelect);

                      

                    }else{

                      $("#loader").addClass("d-none");

                    }
  
                  }
                })

              }else{

                $("#sinAcceso").removeClass("d-none")
                $("#loader").empty()

              }

            }
          );
        });
      });
    }
  );
});



ZOHO.embeddedApp.init();
