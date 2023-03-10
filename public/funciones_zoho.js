const socket = io();


const UrlBase = "https://addapptech.com/";

/**
 *
 * @returns
 */
const TokenZoho = async () => {
  let requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch(UrlBase + "GetToken", requestOptions);

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result = await response.text();
    const AcessToken = result.replace(/"/g, "");
    return AcessToken;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 *
 * @param {*} AcessToken
 * @param {*} IdLoginUser
 * @returns
 */
const getUsersCels = async (AcessToken, IdLoginUser) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    Token: AcessToken,
    UserLogin: IdLoginUser,
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  try {
    const response = await fetch(UrlBase + "GetUsersCels", requestOptions);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let NumerosArray = await response.text();
    NumerosArray = JSON.parse(NumerosArray);
    return NumerosArray;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


/**
 * 
 */
const ListarPlantillas = async () => {

  let requestOptions = {
    method: "POST",
    redirect: "follow",
  };

  try {

    const response = await fetch(UrlBase + "GetTemplates", requestOptions);
    let ArrayTemplates = await response.text();
    ArrayTemplates = JSON.parse(ArrayTemplates);

    let $table = $('#table')

    const {array_Plantillas} = ArrayTemplates;

    console.log(array_Plantillas)
    
    $table.bootstrapTable({data: array_Plantillas})



  }catch (error) {

  }

}




/**
 *
 * @param {*} NumeroTelefonoZoho
 * @param {*} ResponseCelsZoho
 * @returns
 */
const ValidarChats = async (NumeroTelefonoZoho, ResponseCelsZoho, IdLoginUser) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    NumeroTelefonoZoho: NumeroTelefonoZoho,
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  try {
    const response = await fetch(UrlBase + "ValidateCels", requestOptions);

    let DataCelsChats = await response.text();
    DataCelsChats = JSON.parse(DataCelsChats);

    if (DataCelsChats.ok == true) {

      // Convertimos el array de celulares zoho en un array de objetos
      let CelularesZohoUsuario = ResponseCelsZoho.map(NumeroCelular => ({id_chat: null,IdNumeroCelular: null, NumeroCelular}));
      let ChatsArray = DataCelsChats.ArrayDataCelChat;

      // Juntamos el array de numeros de zoho con los que hayan de chats
      let result2 = CelularesZohoUsuario.concat(ChatsArray)

      console.log(result2)

      // Quitamos algun atributo y añadimos otro
      result2 = result2.map((item) => {

        delete item.id_celular_fk;
        item["id_zoho"] = IdLoginUser;

        return item;

      })

      /**
       * Quitamos los duplicados del array
       */
      let uniqueArray = [];
      let obj = {};

      for (let item of result2) {
        if (!obj[item.NumeroCelular]) {
          obj[item.NumeroCelular] = item;
        } else {
          if (obj[item.NumeroCelular].id_chat === null) {
            obj[item.NumeroCelular] = item;
          }
        }
      }
      
      for (let key in obj) {
        uniqueArray.push(obj[key]);
      }

      // Organizamos el array para que los que no tengan chat queden al final
      uniqueArray.sort((a, b) => {
        if (a.id_chat === null && b.id_chat !== null) return 1;
        if (a.id_chat !== null && b.id_chat === null) return -1;
        return 0;
      });

      return {
        ArraySelect: uniqueArray,
      };
  
    }else{

      console.log("Mera vuelta no hay chats")

      // Convertimos el array de celulares zoho en un array de objetos
      let CelularesZohoUsuario = ResponseCelsZoho.map(NumeroCelular => ({id_chat: null,IdNumeroCelular: null, NumeroCelular}));

      // Quitamos algun atributo y añadimos otro
      CelularesZohoUsuario = CelularesZohoUsuario.map((item) => {

        delete item.id_celular_fk;
        item["id_zoho"] = IdLoginUser;

        return item;

      })  

      return {
        ArraySelect: CelularesZohoUsuario,
      };



    }

  } catch (error) {
    console.log(error);
    throw error;
  }
};


const ValidarClienteYCelular = async(NumeroAsesesor,NumeroCliente) => {

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    NumeroAsesesor: NumeroAsesesor,
    NumeroCliente: NumeroCliente
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  try {
    const response = await fetch(UrlBase + "ValidateCelsClients", requestOptions);

    let DataCelular = await response.text();
    DataCelular = JSON.parse(DataCelular);

    console.log(DataCelular)

    if (DataCelular.ok == true) {

      return {
        idNumeroAsesor: DataCelular.idNumeroAsesor,
      };
  
    }

  } catch (error) {
    console.log(error);
    throw error;
  }

}


/**
 * 
 * @param {*} NumeroAsesesor 
 * @param {*} NumeroCliente 
 */
const CrearChatAsesor = async (NumeroAsesesor,NumeroCliente) => {

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    NumeroAsesesor: NumeroAsesesor,
    NumeroCliente: NumeroCliente
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };


  try {

    const response = await fetch(UrlBase + "CrearChatAsesor", requestOptions);

    let dataChat = await response.text();
    dataChat = JSON.parse(dataChat);

    console.log(dataChat);

    return dataChat;
    
  } catch (error) {

    return { 
      error: error
    }
    
  }


};



/**
 *
 * @param {*} NumerosArray
 */
const ListarNumeros = async (NumerosArray) => {

  

  let ListSelect = [];

  NumerosArray.forEach((data) => {
    var info_metPago = {
      text: data.NumeroCelular,
      value: data,
    };

    ListSelect.push(info_metPago);
    ListSelect[0]["selected"] = true;
  });

  $("#SelectNumbers").removeClass("d-none");
  $("#inputResponse").removeClass("d-none");

  console.log("Array en Listar")
  console.log(ListSelect)

  $(function () {
    $("#SelectNumbers").multipleSelect({
      data: ListSelect,
      placeholder: "Seleccionar",
    });
  });
};

/**
 * 
 * @param {*} id_chat 
 */
const ListarChats = async (id_chat) => {

  document.getElementById("output").innerHTML = ""; 

  //console.log(id_chat);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    id_chat: id_chat,
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: raw,
  };

  try {
    const response = await fetch(UrlBase + "GetMessges", requestOptions);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let DataMessages = await response.text();

    DataMessages = JSON.parse(DataMessages);
    DataMessages = DataMessages.DataMensajes;
    //console.log(DataMessages);

    $("#loader").addClass("d-none");

    //$("#loader").empty()

    DataMessages.forEach((Mensaje) => {
      console.log("---- aro -------");
      let TipoMensaje;
      let FechaMensaje = Mensaje.wpp_fecha;
      let align;
      
      FechaMensaje = FechaMensaje.replace("T", " ").replace(".000Z", "");
      FechaMensaje = moment(FechaMensaje).format("DD-MM-YYYY HH:mm");

      if (Mensaje.wpp_id_asesor == null) {
        TipoMensaje = "myDIVblanco";
        align = "left";
        //console.log("recibe");
        //console.log(Mensaje.wpp_clave_int);
      } else {
        TipoMensaje = "myDIV";
        align = "right";
        //console.log("bot");
        //console.log(Mensaje.wpp_clave_int);
      }

      if (Mensaje == "audio") {
        document.getElementById("output").innerHTML += `
        <div style = 'text-align: left; margin-left: 10px;'>
            <div id="" style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>

                <a href="#" class="pop">
                    <img src="${valores.datajson[i].mensaje}"  class="img-thumbnail"  onclick="abririmajen('${valores.datajson[i].mensaje}')" style="width: auto; height: 300px;">
                </a><br>
                <span style="color: #ada9a9;font-size: 10px;">${valores.datajson[i].fecha_hora_wpp}</span>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
            </div>
        </div>`;
      } else if (Mensaje == "immgen") {
        document.getElementById("output").innerHTML += `
        <div style = 'text-align: left; margin-left: 10px;'>
            <div id="">
                <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                <audio src="${valores.datajson[i].mensaje}" preload="auto" controls></audio><br>
                <span style="color: #ada9a9;font-size: 10px;">${valores.datajson[i].fecha_hora_wpp}</span>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                </p>
            </div>
        </div>
        `;
      } else {
        document.getElementById("output").innerHTML += `
        <div style = 'text-align: ${align}; margin-${align}: 10px;'>
            <div id=${TipoMensaje}>
                <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                ${Mensaje.wpp_mensajes}
                <span style="color: #ada9a9;font-size: 10px;">${FechaMensaje}</span>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                </p>
            </div>
        </div>`;
      }

      var div = document.getElementById("output");
      div.scrollTop = "999999999";

    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 
 * @param {*} MensajeAsesor 
 */
const enviarMensajeAsesor = async (MensajeAsesor, tipoMensaje = 0) => {

  const $select = $('select')

  const ArraySelect = $select.multipleSelect('getSelects')[0];
  const NumeroSelect = $select.multipleSelect('getSelects', 'text')[0];

  const allOptions = $select.multipleSelect('getOptions');

  const IdUserLogin = ArraySelect.id_zoho;
  const NumeroCliente = $("#NumeroCelularRegistro").val();
  const fecha = moment().format("YYYY-MM-DD HH:mm:ss");

  console.clear()
  console.log(ArraySelect)

  console.log("========")

  console.log(allOptions)

  $select.multipleSelect('addOption', { value: 'option5', text: 'Opción 5' });
  $select.multipleSelect('refresh');


  /*
  const IdNumeroCelular = ArraySelect.IdNumeroCelular|| (await ValidarClienteYCelular(NumeroSelect,NumeroCliente)).idNumeroAsesor;
  console.log(IdNumeroCelular || "No hay id numero celular")
  const IdChat = ArraySelect.id_chat || (await CrearChatAsesor(NumeroSelect,NumeroCliente)).insertId;
  console.log(IdChat || "No hay id de chat")





  socket.emit("chat:MessageSend", {
    Menssage: MensajeAsesor,
    FechaHora: fecha,
    IdChat: IdChat,
    IdAsesor: IdUserLogin,
    NumeroCliente: NumeroCliente,
    NumeroSelect: NumeroSelect,
    IdNumeroCelular: IdNumeroCelular,
    tipoMensaje: tipoMensaje
  });

  console.log(ArraySelect)
  */
}

/**
 * 
 */
$('#SelectNumbers').change(function() {

  let $select = $('select')

  // console.log('Selected values: ' + $select.multipleSelect('getSelects'))
  // console.log('Selected texts: ' + $select.multipleSelect('getSelects', 'text'))

  let IdChat = $select.multipleSelect('getSelects')[0].id_chat;

  if (IdChat != null) {
    ListarChats(IdChat)
  }else{
    console.log("No hay ID de chat");
    document.getElementById("output").innerHTML = ""; 

  }

});

/**
 * 
 */
$("#SendMessage").click( async () => {

  let MensajeAsesor = $("#message").val();

  if (MensajeAsesor) {

    enviarMensajeAsesor(MensajeAsesor);

  }else{

    console.log("vacio");

  }

  $("#message").val("");

}); 

/**
 * 
 */
$("#message").keypress( async (e) => {
  if (e.which == 13) {

    let MensajeAsesor = $("#message").val();
  
    if (MensajeAsesor) {

      enviarMensajeAsesor(MensajeAsesor);
  
    }else{
  
      console.log("vacio");
  
    }
  
    $("#message").val("");
  
  }
});





function operateFormatter() {
  return [
    '<a class="Enviar" href="javascript:void(0)" title="Enviar">',
    '<i class="bi bi-send-plus" style="color: green"></i>',
    '</a> '
  ].join('')
}

function tipoFormatter(value, row) {
  let tipoPlantilla;

  switch (row.whpp_tipo_plantilla) {
    case 0:
      tipoPlantilla = 'Respuesta rapida'
      break;
    case 1:
      tipoPlantilla = 'Plantilla'
      break;
  
    default:
      tipoPlantilla = 'Pdf'
      break;
  }

  return tipoPlantilla
}

window.operateEvents = {
  'click .Enviar': function (e, value, row, index) {

    if(row.whpp_tipo_plantilla){

      console.log("es plantilla")

      enviarMensajeAsesor(row.whpp_text,row.whpp_tipo_plantilla);

      $('#ModalFastMensaje').modal('hide')

    }else{

      console.log("es mensaje rapido")

      const regex = /&#(\d+);/g;
      let MensajeRapido = row.whpp_text;

      // Buscar los códigos HTML de los emojis en la cadena de entrada y convertirlos en números hexadecimales
      MensajeRapido = MensajeRapido.replace(regex, (match, dec) => {
        return String.fromCodePoint(dec);
      });

      console.clear()

      console.log(MensajeRapido);
      $("#message").val(MensajeRapido);

      $('#ModalFastMensaje').modal('hide')

    }

  }
}



//-------------- Mensaje entrante de un cliente ---------------

socket.on("chat:MessageReceived", function (data) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

  let NumeroCelularRegistro = $("#NumeroCelularRegistro").val();
  
  let $select = $('select')
  let NumeroSelect = $select.multipleSelect('getSelects', 'text');
  NumeroSelect = NumeroSelect[0]

  const {
     
    mensaje,
    numclien,
    tipomensaje,
    id_multimedia,
    numasesor

  } = data;

  const fechHo = moment().format("DD-MM-YYYY HH:mm a");


  if (numclien == NumeroCelularRegistro && NumeroSelect == numasesor) {
    if (tipomensaje != "text" && tipomensaje != "button") {
      if (tipomensaje == "audio") {
        console.log("audio aro ue si");

        // mensaje de audio
        output.innerHTML += `
                <div style = 'text-align: left; margin-left: 10px;'>
                    <div id="">
                        <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                        <audio src="./imajenesmandar/${data.id_multimedia}" preload="auto" controls></audio><br>
                        <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                        <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                        </p>
                    </div>
                </div>
                `;
      } else if (tipomensaje == "image") {
        output.innerHTML += `
                <div style = 'text-align: left; margin-left: 10px;'>
                    <div id="" style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>

                        <a href="#" class="pop">
                            <img src="./imajenesmandar/${data.id_multimedia}"  class="img-thumbnail"  onclick="abririmajen('./imajenesmandar/${data.id_multimedia}')" style="width: 200px; height: auto;">
                        </a><br>
                        <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                        <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                    </div>
                </div>
                `;
      } else if (tipomensaje == "video") {
        console.log("aro videito");

        output.innerHTML += `
                <div style = 'text-align: left; margin-left: 10px;'>
                    <div id="" style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px; width: 100px; height: 100;'>

                        <a href="#" class="pop">

                            <video src="./imajenesmandar/${data.id_multimedia}" preload="auto" controls style="width: 200px; height: 300;"></video>

                        </a><br>
                        
                        <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                        <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                    </div>
                </div>
                `;
      }
    } else {
      output.innerHTML += `
            <div style = 'text-align: left; margin-left: 10px;'>
                <div id="myDIVblanco">
                    <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                    ${mensaje}
                    <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                    <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                    </p>
                </div>
            </div>`;
    }

    $("#output").animate({ scrollTop: 100000 });
  }
});

//-------------- Mensaje saliente de un asesor ---------------

socket.on("chat:MessageSend", function (data) {
  let NumeroCelularRegistro = $("#NumeroCelularRegistro").val();

  let $select = $('select')
  let NumSelect = $select.multipleSelect('getSelects', 'text');
  NumSelect = NumSelect[0];

  let {
    FechaHora,
    Menssage,
    NumeroCliente,
    NumeroSelect
  } = data;

  FechaHora = moment(FechaHora).format("DD-MM-YYYY HH:mm a")

  if (NumeroCliente == NumeroCelularRegistro && NumeroSelect == NumSelect) {
    output.innerHTML += `
        <div style = 'text-align: right; margin-right: 10px;'>
            <div id="myDIV">
                <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                ${Menssage}
                <span style="color: #ada9a9;font-size: 10px;">${FechaHora}</span>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                </p>
            </div>
        </div>
    
        </div>`;
    $("#output").animate({ scrollTop: 100000 });
    //console.log($("#output").text());
    // $("#message").val("");
  }
  
});

// ------------------------------------------------------------

socket.on("chat:message4", function (data) {
  var numcliente = $("#idnumerocliente").val();
  var mensaje_aesor = data.Mensage;
  numcliente = numcliente.substr(1);

  console.log("********************");
  console.log(data.numclien);
  console.log(numcliente);
  console.log("********************");

  if (data.numclien == numcliente) {
    console.log("Entrooo");
    output.innerHTML += `
        <div style = 'text-align: right; margin-right: 10px;'>
            <div id="myDIV">
                <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                ${mensaje_aesor}
                <span style="color: #ada9a9;font-size: 10px;">${data.fecha_hora}</span>
                </p>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
            </div>
        </div>
        </div>`;
    $("#output").animate({ scrollTop: 100000 });
    //console.log($("#output").text());
    $("#message").val("");
  }
});

socket.on("chat:message2", function (data) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  console.log(data);

  /*
    var tipomensaje =  data.tipomensaje;
    var tipodemedia = data.tipodemedia;
    var numcliente = $("#idnumerocliente").val();
    console.log(data);
    var d = new Date();
    var mess = d.getMonth() + 1;
    var fechHo = d.getFullYear()+"/"+mess+"/"+d.getDate()+" "+ d.getHours()+":"+ d.getMinutes();
    console.log(data.numclien);
    console.log(numcliente);
    if(data.numclien == numcliente){
        
        // 1 es un mensaje de audio o imagen
        if(tipomensaje != "text"){
            if(tipodemedia == "audio/ogg"){
                // mensaje de audio
                output.innerHTML +=`
                <div style = 'text-align: left; margin-left: 10px;'>
                    <div id="">
                        <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                        <audio src="${data.mensaje}" preload="auto" controls></audio><br>
                        <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                        <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                        </p>
                    </div>
                </div>
                `;

            }else if(tipodemedia == "image/jpeg"){
                //mensaje de imagen <img src="..." class="img-fluid" alt="Responsive image">


                output.innerHTML +=`
                <div style = 'text-align: left; margin-left: 10px;'>
                    <div id="" style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>

                        <a href="#" class="pop">
                            <img src="${data.mensaje}"  class="img-thumbnail"  onclick="abririmajen('${data.mensaje}')" style="width: 300px; height: auto;">
                        </a><br>
                        <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                        <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                    </div>
                </div>
                `;
            }

        }else{
            output.innerHTML +=`
            <div style = 'text-align: left; margin-left: 10px;'>
                <div id="myDIVblanco">
                    <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                    ${data.mensaje}
                    <span style="color: #ada9a9;font-size: 10px;">${fechHo}</span>
                    <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
                    </p>
                </div>
            </div>`;
        }

        $("#output").animate({scrollTop: 100000});
    
    }
    */
});

socket.on("chat:message3", function (data) {
  var numcliente = $("#idnumerocliente").val();
  console.log(data.mensaje);
  console.log("si estoy pasado por aca");
  var d = new Date();
  var fechHo =
    d.getFullYear() +
    "/" +
    d.getMonth() +
    "/" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes();
  console.log(data.numclien);
  console.log(numcliente);
  if (data.numclien == numcliente) {
    output.innerHTML += `
        <div style = 'text-align: right; margin-right: 10px;'>
            <div id="myDIV">
                <p id='asesor' style = 'margin-bottom: 3px; margin-left: 8px; margin-right: 8px; margin-top: 3px;'>
                ${data.mensaje}
                <span style="color: #ada9a9;font-size: 10px;">${data.FechaHora}</span>
                </p>
                <span data-testid="msg-dblcheck" aria-label=" Leído " data-icon="msg-dblcheck" class="_3l4_3"><svg viewBox="0 0 16 15" width="16" height="15" class=""><path fill="currentColor" d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg></span>
            </div>
        </div>`;
    $("#output").animate({ scrollTop: 100000 });

    var datajson = { mensaje: data.mensaje, fechahora: fechHo };
    mensageasesor(datajson);
  }

  //console.log($("#output").text());
  //$("#message").val("");
});




