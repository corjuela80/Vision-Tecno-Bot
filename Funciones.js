const dbConn = require("./config/db.config");
const moment = require("moment");
const axios = require("axios");
const emojiRegex = require("emoji-regex");
require("moment/locale/es");

// ***************************************** Mensajes del bot **********************************************

// ------------------- Variables de Meta -------------------
const url_api = "https://graph.facebook.com/v14.0/";
const whpp_key =
  "Bearer EAALcs8ukVs0BAGMEyFnh26kiwLRAyyubT017kLd8ZA5N7uu8bhKG0eUcGgVfq1R43XigTzH02qucXLTAHJcvx7Ce7X859RlJ42e43GLVjRRxZCOhvdBZAAqkE3BD94AoBFoKI8ZAZAkLZBbeSBZBdDsj3hmlsRPqXXFOGBtndJZAz0zEWgKG8cIH";

const MensajesBot = [
  {
    Tipo: "Texto",
    Categoria: "Ausencia",
    Mensaje: `
    ¡Hola! Somos *Visión Tecno 🤖*,En este momento ninguno de nuestros asesores especializados se encuentra disponible. \n\n 📆 *Agenda tu asesoría personalizada* por el canal que desees en el siguiente link: \n\n https://www.visiontecno.com/contactenos \n te contactaremos lo antes posible. Gracias por escribirnos
    `,
    Valor: 1,
  },
  {
    Tipo: "Texto",
    Categoria: "PedirCorreo",
    Mensaje: `
    Hola! 👋🏻 Somos Visión Tecno Partner Premium de Zoho con más de 15 años de experiencia. Consultores CRM, líderes en transformación digital e implementación de las aplicaciones de Zoho. \n\n *Digita tu correo electrónico:*
    `,
    Valor: 2,
  },
  {
    Tipo: "Texto",
    Categoria: "EmailIncorrecto",
    Mensaje: `Email incorrecto, por favor ingrese un formato válido`,
    Valor: 3,
  },
  {
    Tipo: "Plantilla",
    Categoria: "Confirmacion",
    Mensaje: "<-- Se envio un documento -->",
    Valor: 4,
  },
];

// ***************************************** Funciones y Api **********************************************

/**
 *
 * @param {*} msj
 * @returns
 */
const Validar_email = async (msj) => {
  return /^\S+@\S+\.\S+$/.test(msj);
};

// ***************************************** Creaciones y validaciones ***********************************************

/**
 * 
 * @returns 
 */
async function TokenZoho() {
  var config = {
    method: "post",
    url: "https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.8a34d23ff36312d8ee250be6ead8e44f.8956c73080a343271b0822778b7b6b17&client_id=1000.F21NAZIY3VQW8M6UDB7R9WW1GQ175A&client_secret=82c722ac87fb852be5cce5b8f057c4c64fba851547&redirect_uri=https://WhatsApp_demox.com&grant_type=refresh_token",
    headers: {
      Cookie:
        "JSESSIONID=D1F6DDE72917393D67A48E895E42ECFA; _zcsr_tmp=f26c9a17-2d94-408b-bd38-a6117ce21ad6; b266a5bf57=57c7a14afabcac9a0b9dfc64b3542b70; iamcsr=f26c9a17-2d94-408b-bd38-a6117ce21ad6",
    },
  };

  let Token = await axios(config);
  return Token.data.access_token;
}

/**
 * Funcion encargada de hacer las peticiones a la base de datos
 * @param {*} query
 * @param {*} params
 * @returns
 */
const mysqlRequest = (query, params = []) => {
  const queryStructure = {
    query,
    params,
  };
  return new Promise((resolve, reject) => {
    dbConn.query(
      queryStructure.query,
      queryStructure.params,
      (err, rows, fields) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

/**
 *
 * @param {*} TokenZoho
 * @param {*} num_cel
 * @returns
 */
const ValidateLeadZoho = async (TokenZoho, num_cel) => {
  try {
    var config = {
      method: "get",
      url:
        "https://www.zohoapis.com/crm/v2/Leads/search?criteria=((Mobile:equals:" +
        num_cel +
        "))",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
    };

    let DataLead = await axios(config);

    if (DataLead.data) {
      return {
        ok: true,
        id_client_zoho: DataLead.data.data[0].id,
        nombreClient: DataLead.data.data[0].Full_Name,
        msg: "Lead encontrado con exito",
      };
    }

    return {
      ok: false,
      msg: "Lead no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} TokenZoho
 * @param {*} num_cel
 * @returns
 */
const ValidateContactZoho = async (TokenZoho, num_cel) => {
  try {
    var config = {
      method: "get",
      url:
        "https://www.zohoapis.com/crm/v2/Contacts/search?criteria=((Mobile:equals:" +
        num_cel +
        "))",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
    };

    let DataContact = await axios(config);

    if (DataContact.data) {
      return {
        ok: true,
        id_client_zoho: DataContact.data.data[0].id,
        nombreClient: DataLead.data.data[0].Full_Name,
        msg: "Contacto encontrado con exito",
      };
    }

    return {
      ok: false,
      msg: "Contacto no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} TokenZoho
 * @param {*} nombreCliente
 * @param {*} numeroCliente
 * @returns
 */
const CreateLeadZoho = async (TokenZoho, nombreCliente, numeroCliente) => {
  try {
    var data = JSON.stringify({
      data: [
        {
          Last_Name: "WhatsApp",
          First_Name: nombreCliente,
          Mobile: "+" + numeroCliente,
          Lead_Source: "WhatsApp Integration",
        },
      ],
    });

    var config = {
      method: "post",
      url: "https://www.zohoapis.com/crm/v2/Leads",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        "Content-Type": "application/json",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; JSESSIONID=6DB07B563603ED63FD96057C2867BC88; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
      data: data,
    };

    let DataInsertLead = await axios(config);

    if (DataInsertLead.data.data[0]) {
      return {
        ok: true,
        id_client_zoho: DataInsertLead.data.data[0].details.id,
        msg: "Lead creado con exito",
      };
    }

    return {
      ok: false,
      msg: "Lead no creado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} numero
 * @returns
 */
const ValidateCliente = async (numero) => {
  const query = {
    query: `SELECT wpp_id_cliente FROM tbl_clientes WHERE wpp_numero=?`,
    params: [numero],
  };
  try {
    const id_cliente = await mysqlRequest(query.query, query.params);

    if (id_cliente.length > 0) {
      return {
        ok: true,
        id_cliente: id_cliente[0].wpp_id_cliente,
        msg: "cliente encontrado con exito",
      };
    }
    return {
      ok: false,
      msg: "cliente no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} numero
 * @returns
 */
const ValidateNumeroAsesor = async (numero) => {
  const query = {
    query: `SELECT id_celular,id_numero_celular FROM tbl_celulares WHERE numero_celular=?`,
    params: [numero],
  };
  try {
    const id_celular = await mysqlRequest(query.query, query.params);

    console.log(id_celular);

    if (id_celular.length > 0) {
      return {
        ok: true,
        id_celular: id_celular[0].id_celular,
        id_numero_celular: id_celular[0].id_numero_celular,
        msg: "celular encontrado con exito",
      };
    }
    return {
      ok: false,
      msg: "celular no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} DataInsert
 * @returns
 */
const CreateMessageZoho = async (DataInsert) => {
  const {
    TokenZoho,
    client_tipo,
    id_client_zoho,
    Mensaje_client,
    fechaYHora,
    num_cel,
  } = DataInsert;

  try {
    var data = {
      data: [
        {
          mensaje: Mensaje_client,
          numero_cliente: num_cel,
          responde: false,
          fecha_hora_wpp: fechaYHora,
        },
      ],
    };

    if (client_tipo == "Lead") {
      data.data[0]["Posible_Cliente"] = id_client_zoho;
    } else if (client_tipo == "Contact" || client_tipo == "Duplicado") {
      data.data[0]["Cliente"] = id_client_zoho;
    }

    data = JSON.stringify(data);

    var config = {
      method: "post",
      url: "https://www.zohoapis.com/crm/v2/mensajes_wpp",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        "Content-Type": "application/json",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; JSESSIONID=6DB07B563603ED63FD96057C2867BC88; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
      data: data,
    };

    let DataInsertMessage = await axios(config);

    return {
      ok: false,
      msg: "Mensaje en zoho creado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} nombreCliente
 * @param {*} numeroCliente
 * @returns
 */
const CrearCliente = async (
  nombreCliente,
  numeroCliente,
  id_client_zoho,
  client_tipo
) => {
  const query = {
    query: `INSERT INTO tbl_clientes (wpp_nombre,wpp_numero,wpp_fecha_hora_creacion,wpp_zoho_id,wpp_cli_tipo) VALUES(?,?,?,?,?)`,
    params: [
      nombreCliente,
      numeroCliente,
      moment().format("YYYY-MM-DD HH:mm:ss").utcOffset(-300),
      id_client_zoho,
      client_tipo,
    ],
  };
  try {
    const cliente = await mysqlRequest(query.query, query.params);
    return {
      ok: true,
      id_cliente: cliente.insertId,
      msg: "cliente registrado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} id_cliente
 * @param {*} id_celular
 * @returns
 */
const ValidarChat = async (id_cliente, id_celular) => {
  const query = {
    query: `SELECT id_chat FROM tbl_chats WHERE id_celular_fk = ? AND id_cliente_fk = ?`,
    params: [id_celular, id_cliente],
  };
  try {
    const id_chat = await mysqlRequest(query.query, query.params);
    if (id_chat.length > 0) {
      return {
        ok: true,
        id_chat: id_chat[0].id_chat,
        msg: "chat encontrado con exito",
      };
    }
    return {
      ok: false,
      msg: "chat no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} id_cliente
 * @param {*} id_celular
 * @returns
 */
const CrearChat = async (id_cliente, id_celular) => {
  const query = {
    query: `INSERT INTO tbl_chats (id_celular_fk,id_cliente_fk) VALUES(?,?)`,
    params: [id_celular, id_cliente],
  };
  try {
    const chat = await mysqlRequest(query.query, query.params);

    return {
      ok: true,
      id_chat: chat.insertId,
      msg: "chat registrado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} fechaYHora
 * @param {*} Mensaje_client
 * @param {*} id_chat
 * @returns
 */
const ValidarBot = async (fechaYHora, Mensaje_client, id_chat) => {
  let day = moment(fechaYHora).locale("es").format("dddd");
  let Hora_msj = moment(fechaYHora).format("HH:mm");

  let query = {
    query: `SELECT * FROM tbl_horas WHERE dia = ?`,
    params: [day],
  };

  /**
   * Tipo de Respuesta del bot
   * 1) Ausencia
   * 2) Pedir correo
   * 3) Email Incorrecto
   * 4) Confirmacion
   */
  let TipoRespuesta;

  const msgInfo = {
    wpp_error: null,
    wpp_fuera_hora: null,
    whpp_msj_correo: null,
  };
  try {
    /**
     * Validar el fuera de horario
     */
    const responseHoras = await mysqlRequest(query.query, query.params);

    const {
      wpp_inicio,
      wpp_fin,
      wpp_hora_descanso_inicio,
      wpp_hora_descanso_fin,
      wpp_estado,
    } = responseHoras[0];

    if (
      wpp_estado == 0 ||
      Hora_msj < wpp_inicio ||
      Hora_msj > wpp_fin ||
      (Hora_msj > wpp_hora_descanso_inicio && Hora_msj < wpp_hora_descanso_fin)
    ) {
      TipoRespuesta = 1;
      msgInfo.wpp_fuera_hora = 1;

      return { msgInfo, TipoRespuesta };
    } else {
      /**
       *
       * --------------- Validamos que estamos dentro del horario establecido -----------------
       *
       */

      try {
        /**
         * Validamos si hay mensaje anterior
         */

        let query = {
          query: `SELECT * FROM tbl_mensajes WHERE whpp_id_chat = ? AND wpp_id_asesor IS NULL ORDER BY wpp_clave_int DESC LIMIT 1`,
          params: [id_chat],
        };

        const responseMensajes = await mysqlRequest(query.query, query.params);

        if (responseMensajes.length > 0) {
          let { wpp_fecha, whpp_msj_correo, wpp_clave_int, wpp_error } =
            responseMensajes[0];

          try {
            /**
             * Validamos si el mensaje esta fuera del tiempo de reinicio
             */

            let query = {
              query: `SELECT * FROM tbl_variables`,
            };

            const responseMensajes = await mysqlRequest(query.query);

            const { horas_control } = responseMensajes[0];

            

            const fechaYa = moment().utcOffset(-300).format('YYYY-MM-DD HH:mm:ss');

            let DiferenciaHoras = moment(fechaYa).diff(moment(wpp_fecha), "hours");


            /**
             * Validamos si pasaron las horas del reinicio del bot
             */

            if (DiferenciaHoras >= horas_control) {
              /**
               * Ya pasaron las horas especificadas volvemos a pedir el correo
               */

              msgInfo.whpp_msj_correo = 0;
              TipoRespuesta = 2;
            } else {
              /**
               * Validamos si ya dijito el correo o lo esta digitando
               */

              if (whpp_msj_correo) {
                msgInfo.whpp_msj_correo = 1;
              } else {
                /**
                 * validamos si el mensaje es correcto
                 */

                const correo_validao = await Validar_email(Mensaje_client);

                if (correo_validao) {
                  msgInfo.whpp_msj_correo = 1;
                  TipoRespuesta = 4;
                } else {
                  console.log("Email Incorrecto");

                  if (wpp_error <= 3) {
                    TipoRespuesta = 3;
                  }

                  msgInfo.whpp_msj_correo = 0;
                  msgInfo.wpp_error = wpp_error + 1;
                }
              }
            }

            return { msgInfo, TipoRespuesta };
          } catch (error) {
            return {
              ok: false,
              msg: "Hubo un error en el servidor: " + error,
            };
          }
        } else {
          /**
           * No se encontro mensajes preguntamos por el correo
           */

          console.log("No hay mensajes anteriores");
          msgInfo.whpp_msj_correo = 0;
          TipoRespuesta = 2;

          return { msgInfo, TipoRespuesta };
        }
      } catch (error) {
        return {
          ok: false,
          msg: "Hubo un error en el servidor: " + error,
        };
      }
    }
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} infoMessage
 * @returns
 */
const createMessage = async (infoMessage) => {
  let {
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
    id_chat,
  } = infoMessage;

  //------------ convertir emojis a hexadecimal --------------
  const regex = emojiRegex();
  for (const match of Mensaje_client.matchAll(regex)) {
    const emoji = match[0];
    let hex = parseInt(emoji.codePointAt(0).toString(16), 16);
    Mensaje_client = Mensaje_client.replace(emoji, `&#${hex};`);
  }

  const query = {
    query: `INSERT INTO tbl_mensajes (
      wpp_mensajes,
      wpp_fecha,
      wpp_id_asesor,
      wpp_error,
      wpp_fuera_hora,
      wpp_id_mensaje,
      wpp_unix,
      whpp_msj_correo,
      whpp_type,
      whpp_mime_type,
      whpp_id_multimedia,
      whpp_id_chat
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    params: [
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
      id_chat,
    ],
  };
  try {
    await mysqlRequest(query.query, query.params);
    return {
      ok: true,
      msg: "mensaje registrado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} TipoRespuesta
 * @param {*} num_cel
 * @param {*} id_celular_asesor
 */
const EnviarMessageBot = async (TipoRespuesta, num_cel, id_celular_asesor) => {


  const [MensajeOjt] = MensajesBot.filter(
    (MensajeOjt) => MensajeOjt.Valor == TipoRespuesta
  );

  if (MensajeOjt.Categoria != "Confirmacion") {
    try {
      var data = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: num_cel,
        type: "text",
        text: {
          preview_url: false,
          body: MensajeOjt.Mensaje,
        },
      });

      var config = {
        method: "post",
        url: url_api + id_celular_asesor + "/messages",
        headers: {
          "Content-Type": "application/json",
          Authorization: whpp_key,
        },
        data: data,
      };

      let ResponseApiMsm = await axios(config);

      return {
        ok: true,
        IdMensajeBot: ResponseApiMsm.data.messages[0].id,
        MensajeBot: MensajeOjt.Mensaje,
        msg: "Mensaje del bot enviado con exito",
      };
    } catch (error) {
      return {
        ok: false,
        msg: "Hubo un error en el servidor: " + error,
      };
    }
  } else {
    try {
      var data = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: num_cel,
        type: "document",
        document: {
          link: "https://vision-tecno-whpp.s3.us-west-1.amazonaws.com/Vision_tecno.pdf",
          filename: "Visión Tecno",
        },
      });

      var config = {
        method: "post",
        url: url_api + id_celular_asesor + "/messages",
        headers: {
          "Content-Type": "application/json",
          Authorization: whpp_key,
        },
        data: data,
      };

      let ResponseApiMsm = await axios(config);

      return {
        ok: true,
        IdMensajeBot: ResponseApiMsm.data.messages[0].id,
        MensajeBot: MensajeOjt.Mensaje,
        msg: "Mensaje del bot enviado con exito",
      };
    } catch (error) {
      return {
        ok: false,
        msg: "Hubo un error en el servidor: " + error,
      };
    }
  }
};

/**
 *
 * @param {*} infoMessage
 * @returns
 */
const createMessageBot = async (infoMessage) => {

  let {
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
    id_chat,
  } = infoMessage;

  //------------ convertir emojis a hexadecimal --------------
  const regex = emojiRegex();
  for (const match of MensajeBot.matchAll(regex)) {
    const emoji = match[0];
    let hex = parseInt(emoji.codePointAt(0).toString(16), 16);
    MensajeBot = MensajeBot.replace(emoji, `&#${hex};`);
  }

  const query = {
    query: `INSERT INTO tbl_mensajes (
      wpp_mensajes,
      wpp_fecha,
      wpp_id_asesor,
      wpp_error,
      wpp_fuera_hora,
      wpp_id_mensaje,
      wpp_unix,
      whpp_msj_correo,
      whpp_type,
      whpp_mime_type,
      whpp_id_multimedia,
      whpp_id_chat
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    params: [
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
      id_chat,
    ],
  };
  try {
    await mysqlRequest(query.query, query.params);
    return {
      ok: true,
      msg: "mensaje bot registrado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} DataInsert
 * @returns
 */
const CreateMessageZohoBot = async (DataInsert) => {
  const {
    TokenZoho,
    client_tipo,
    id_client_zoho,
    MensajeBot,
    fechaYhoraBot,
    celular_asesor,
  } = DataInsert;

  try {
    var data = {
      data: [
        {
          mensaje: MensajeBot,
          numero_cliente: celular_asesor,
          responde: true,
          fecha_hora_wpp: fechaYhoraBot,
        },
      ],
    };

    if (client_tipo == "Lead") {
      data.data[0]["Posible_Cliente"] = id_client_zoho;
    } else if (client_tipo == "Contact" || client_tipo == "Duplicado") {
      data.data[0]["Cliente"] = id_client_zoho;
    }

    data = JSON.stringify(data);

    var config = {
      method: "post",
      url: "https://www.zohoapis.com/crm/v2/mensajes_wpp",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        "Content-Type": "application/json",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; JSESSIONID=6DB07B563603ED63FD96057C2867BC88; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
      data: data,
    };

    let DataInsertMessage = await axios(config);

    return {
      ok: false,
      msg: "Mensaje en zoho bot creado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 * ------------------------- Funciones desde la vista ------------------------
 */


/**
 * 
 */
const GetTemplates = async () => {

  const query = {
    query: `SELECT * FROM tbl_plantillas`,
    params: [],
  };
  try {
    const plantillas = await mysqlRequest(query.query, query.params);

    return {
      ok: true,
      array_Plantillas: plantillas,
      msg: "Plantillas encontradas con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor --> " + error,
    };
  }


}

/**
 *
 * @param {*} NumeroZoho
 * @returns
 */
const ValidateCelsZoho = async (NumeroZoho) => {
  const query = {
    query: `SELECT tbl_chats.id_chat, tbl_chats.id_celular_fk FROM tbl_chats WHERE id_cliente_fk = (SELECT tbl_clientes.wpp_id_cliente FROM tbl_clientes WHERE tbl_clientes.wpp_numero = ? )`,
    params: [NumeroZoho],
  };
  try {
    const DataCelsChats = await mysqlRequest(query.query, query.params);

    if (DataCelsChats.length > 0) {
      const array_celulares = [];

      for (const item of DataCelsChats) {
        let id_cel = item.id_celular_fk;

        const query = {
          query: `SELECT numero_celular,id_numero_celular FROM tbl_celulares WHERE id_celular = ?`,
          params: [id_cel],
        };

        try {
          const DataNumero = await mysqlRequest(query.query, query.params);

          console.log("****************************");

          item["NumeroCelular"] = DataNumero[0].numero_celular;
          item["IdNumeroCelular"] = DataNumero[0].id_numero_celular;
          array_celulares.push(DataNumero[0].numero_celular);
        } catch (error) {
          return {
            ok: false,
            msg: "Hubo un error en el servidor: " + error,
          };
        }
      }

      return {
        ok: true,
        ArrayCelulares: array_celulares,
        ArrayDataCelChat: DataCelsChats,
        msg: "cliente encontrado con exito",
      };
    }
    return {
      ok: false,
      msg: "Chats no encontrados",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} id_Chat
 * @returns
 */
const GetMessages = async (id_Chat) => {
  const query = {
    query: `SELECT wpp_clave_int,wpp_mensajes,wpp_fecha,wpp_id_asesor,whpp_type FROM tbl_mensajes WHERE whpp_id_chat = ?`,
    params: [id_Chat],
  };
  try {
    const DataMensajes = await mysqlRequest(query.query, query.params);

    if (DataMensajes.length > 0) {
      return {
        ok: true,
        DataMensajes: DataMensajes,
        msg: "chat encontrado con exito",
      };
    }
    return {
      ok: false,
      msg: "Mensajes no encontrados no encontrado",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 * 
 * @param {*} Menssage 
 * @param {*} NumeroCliente 
 * @param {*} IdNumeroCelular 
 * @param {*} tipoMensaje 
 * @returns 
 */

const EnviarMessageAsesor = async (
  Menssage,
  NumeroCliente,
  IdNumeroCelular,
  tipoMensaje
) => {
  console.log("Respondiendo Asesor..");

  if(tipoMensaje == 2){

    console.log("enviando plantilla...")

    try {
      var data = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: NumeroCliente,
        type: "document",
        document: {
          link: "https://vision-tecno-whpp.s3.us-west-1.amazonaws.com/Vision_tecno.pdf",
          filename: "Visión Tecno",
        },
      });

      var config = {
        method: "post",
        url: url_api + IdNumeroCelular + "/messages",
        headers: {
          "Content-Type": "application/json",
          Authorization: whpp_key,
        },
        data: data,
      };

      let ResponseApiMsm = await axios(config);

      return {
        ok: true,
        IdMensajeBot: ResponseApiMsm.data.messages[0].id,
        MensajeBot: Menssage,
        msg: "Mensaje del bot enviado con exito",
      };
    } catch (error) {
      return {
        ok: false,
        msg: "Hubo un error en el servidor: " + error,
      };
    }

  }else if(tipoMensaje == 0){

    try {
      var data = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: NumeroCliente,
        type: "text",
        text: {
          preview_url: false,
          body: Menssage,
        },
      });
  
      var config = {
        method: "post",
        url: url_api + IdNumeroCelular + "/messages",
        headers: {
          "Content-Type": "application/json",
          Authorization: whpp_key,
        },
        data: data,
      };
  
      let ResponseApiMsm = await axios(config);
  
      return {
        ok: true,
        IdMensajeAsesor: ResponseApiMsm.data.messages[0].id,
        msg: "Mensaje del asesor enviado con exito",
      };
    } catch (error) {
      return {
        ok: false,
        msg: "Hubo un error en el servidor: " + error,
      };
    }

  }else{


    try {

      
      let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": NumeroCliente,
        "type": "template",
        "template": {
          "name": "conoce_whpp_zoho",
          "language": {
            "code": "es"
          }
        }
      });

      let config = {
        method: "post",
        url: url_api + IdNumeroCelular + "/messages",
        headers: {
          "Content-Type": "application/json",
          Authorization: whpp_key,
        },
        data: data,
      };

      let ResponseApiMsm = await axios(config);

      return {
        ok: true,
        IdMensajeBot: ResponseApiMsm.data.messages[0].id,
        MensajeBot: Menssage,
        msg: "Mensaje del bot enviado con exito",
      };
    } catch (error) {
      return {
        ok: false,
        msg: "Hubo un error en el servidor: " + error,
      };
    }

    

  }


};
var data = JSON.stringify({
  "messaging_product": "whatsapp",
  "to": "573205764796",
  "type": "template",
  "template": {
    "name": "conoce_whpp_zoho",
    "language": {
      "code": "es"
    }
  }
});

/**
 *
 * @param {*} infoMessage
 * @returns
 */
const createMessageAsesor = async (infoMessage) => {
  let { Menssage, FechaHora, IdAsesor, IdMensajeAsesor, type_msj, IdChat } =
    infoMessage;

  //------------ convertir emojis a hexadecimal --------------
  const regex = emojiRegex();
  for (const match of Menssage.matchAll(regex)) {
    const emoji = match[0];
    let hex = parseInt(emoji.codePointAt(0).toString(16), 16);
    Menssage = Menssage.replace(emoji, `&#${hex};`);
  }

  const query = {
    query: `INSERT INTO tbl_mensajes (
      wpp_mensajes,
      wpp_fecha,
      wpp_id_asesor,
      wpp_id_mensaje,
      whpp_type,
      whpp_id_chat
      ) VALUES(?,?,?,?,?,?)`,
    params: [Menssage, FechaHora, IdAsesor, IdMensajeAsesor, type_msj, IdChat],
  };
  try {
    await mysqlRequest(query.query, query.params);
    return {
      ok: true,
      msg: "mensaje asesor registrado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 *
 * @param {*} DataInsert
 * @returns
 */
const CreateMessageZohoAsesor = async (DataInsert) => {
  const {
    TokenZoho,
    client_tipo,
    id_client_zoho,
    Menssage,
    FechaHora,
    NumeroSelect,
  } = DataInsert;

  try {
    var data = {
      data: [
        {
          mensaje: Menssage,
          numero_cliente: NumeroSelect,
          responde: true,
          fecha_hora_wpp: FechaHora,
        },
      ],
    };

    if (client_tipo == "Lead") {
      data.data[0]["Posible_Cliente"] = id_client_zoho;
    } else if (client_tipo == "Contact" || client_tipo == "Duplicado") {
      data.data[0]["Cliente"] = id_client_zoho;
    }

    data = JSON.stringify(data);

    var config = {
      method: "post",
      url: "https://www.zohoapis.com/crm/v2/mensajes_wpp",
      headers: {
        Authorization: "Zoho-oauthtoken " + TokenZoho + "",
        "Content-Type": "application/json",
        Cookie:
          "1a99390653=0a0cd8f8f863c606ad892b381901fd90; JSESSIONID=6DB07B563603ED63FD96057C2867BC88; _zcsr_tmp=33141a31-82f4-42c4-8493-c68d11928610; crmcsr=33141a31-82f4-42c4-8493-c68d11928610",
      },
      data: data,
    };

    let DataInsertMessage = await axios(config);

    return {
      ok: true,
      msg: "Mensaje en zoho asesor creado con exito",
    };
  } catch (error) {
    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };
  }
};

/**
 * 
 * @param {*} NumeroAsesesor 
 * @param {*} NumeroCliente 
 * @returns 
 */
const CrearChatAsesor = async (NumeroAsesesor, NumeroCliente) => {

  const query = {
    query: `INSERT INTO tbl_chats (id_celular_fk, id_cliente_fk)
    SELECT CE.id_celular, CL.wpp_id_cliente 
    FROM tbl_celulares CE 
    INNER JOIN tbl_clientes CL 
    ON CL.wpp_numero = ? 
    WHERE CE.numero_celular = ?`,
    params: [NumeroCliente, NumeroAsesesor],
  };
  try {

    let DataChat = await mysqlRequest(query.query, query.params);

    let { insertId } = DataChat ;

    return {
      ok: true,
      insertId,
      msg: "Chat insertado",
    };

  } catch (error) {

    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };

  }


}

/**
 * 
 * @param {*} NumeroAsesesor 
 * @param {*} NumeroCliente 
 * @returns 
 */
const ValidateCelsClients = async (NumeroAsesesor, NumeroCliente) => {

  const query = {
    query: `SELECT * FROM tbl_clientes WHERE wpp_numero = ?`,
    params: [NumeroCliente],
  };
  try {

    let DataClient = (await mysqlRequest(query.query, query.params));

    if(!DataClient.length){

      
      let ValidarClienteCelAsesor = await TokenZoho().then( async (tokenZoho) => {

        const numcel_zoho = "+" + NumeroCliente;
        const numcel_zoho_url = encodeURIComponent(numcel_zoho);

        return Promise.all([
          ValidateLeadZoho(tokenZoho, numcel_zoho_url),
          ValidateContactZoho(tokenZoho, numcel_zoho_url),
        ]).then(async ([DataLead, DataContact]) => {
  
          let id_client_zoho;
          let client_tipo;
          let nombreClient;
  
          if (DataLead.ok && !DataContact.ok) {
            id_client_zoho = DataLead.id_client_zoho;
            nombreClient = DataLead.nombreClient;
            client_tipo = "Lead";
            console.log("¡Lead!");
          }else if (!DataLead.ok && DataContact.ok) {
            id_client_zoho = DataContact.id_client_zoho;
            nombreClient = DataLead.nombreClient;
            client_tipo = "Contact";
            console.log("¡Contact!");
          }else if(!DataLead.ok && !DataContact.ok){
            console.log("¡Datos de zoho no encontrados!");
            id_client_zoho = "0";
            client_tipo = "Lead";
          }else{
            console.log("¡Datos de zoho duplicados!");
            id_client_zoho = DataContact.id_client_zoho;
            nombreClient = DataLead.nombreClient;
            client_tipo = "Duplicado";
          }

          nombreClient = (nombreClient.includes("WhatsApp")) ? nombreClient.replace("WhatsApp","") : nombreClient;

          console.log(id_client_zoho)
          console.log(nombreClient)

          return CrearCliente(nombreClient, NumeroCliente,id_client_zoho,client_tipo).then( async (InsertCliente) => {

            console.log(InsertCliente)

            if(InsertCliente.ok){

              return ValidateNumeroAsesor(NumeroAsesesor).then( async (dataNumeroAsesor) => {

                return {

                  ok: true,
                  msm: "se encontro id celular asesor",
                  idNumeroAsesor: dataNumeroAsesor.id_numero_celular

                }

              });
              

            }

          })



        });


      })

      return ValidarClienteCelAsesor;

    }else{

      console.log("si hay usuario registrado")

      let ValidarClienteCelAsesor = await ValidateNumeroAsesor(NumeroAsesesor).then( async (dataNumeroAsesor) => {

        return {

          ok: true,
          msm: "se encontro id celular asesor",
          idNumeroAsesor: dataNumeroAsesor.id_numero_celular

        }

      });

      return ValidarClienteCelAsesor;

    }



  } catch (error) {

    return {
      ok: false,
      msg: "Hubo un error en el servidor: " + error,
    };

  }


};




module.exports = {
  TokenZoho,
  GetTemplates,
  ValidateCliente,
  ValidateNumeroAsesor,
  CreateMessageZoho,
  CrearCliente,
  ValidateLeadZoho,
  ValidateContactZoho,
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
};
