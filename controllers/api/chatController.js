"using strict";
const models = require('../../models');
var helper = require("../../helpers/helper_functions.js");
const Op = models.Sequelize.Op;

exports.initChatProcess = (io) => {
  var name;
  var adminSocketid = "";
  var adminStatus = "offline";
  const clients = {};
  io.on('connection', (socket) => {
    console.log('New user connected..................');
    var d = new Date();
    var datestring = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
      d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

    //when web site first visit a client
    // socket.on('site visit', (data) => {
    //  // console.log(data);
    //   let broserName = socket.handshake.headers['sec-ch-ua'].split(',')[2];
    //   let browsername = broserName.split(';')[0].replace('"', '');
    //   let browser_name = browsername.replace('"', '');
    //   let device = socket.handshake.headers['sec-ch-ua-platform'].replace('"', "");
    //   device = device.replace('"', '');

    //   // Create a Session
    //   const sessionData = {
    //     store_id: data.storeId,
    //     session_id: socket.id,
    //     location: "",
    //     ip_address: socket.handshake.address,
    //     device_name: device,
    //     device_type: device,
    //     browser: browser_name,
    //     path_json: "",
    //     reference_url: socket.handshake.headers.referer,
    //     no_of_hits: 1
    //   };

    //   models.sessions.create(sessionData)
    //     .then(data => {
    //       //res.send(data);
    //       //res.redirect('/');
    //     })
    //     .catch(err => {
    //       console.log(err.message);
    //     });
    // });


    //when client first submit the form
    socket.on('joining msg', async (data) => {
      name = data.name;

      //fetch client details
      await models.chatUsers.findOne({
        where: {
          email: data.email,
          store_id: data.storeId
        }
      })
        .then(async data1 => {
          if (data1) {
            console.log("user already exists ==> ", data1.id);

            let client = {
              session_id: socket.id,
              client_ip: socket.handshake.address,
              name: data.name,
              mobile_no: data.contact_no,
              message: data.first_message,
              status: "Online"
            };
            //update user if user already exists
            await models.chatUsers.update(client, {
              where: { id: data1.id }
            })
              .then(async num => {
                clients[socket.id] = data1.id;
                const messageData = {
                  store_id: data1.store_id,
                  chatUserId: data1.id,
                  type: "receiver",
                  adminUserId: data1.id,
                  adminUserName: data1.name,
                  message: data.first_message,
                  msg_read: "no",
                  page_url: socket.handshake.headers.referer
                };
                var insertMsgData = await newMessageInsert(messageData);
                if (insertMsgData) {
                  models.chatMessages.findAll({
                    where: {
                      chatUserId: data1.id,
                      store_id: data1.store_id
                    }
                  })
                    .then(async data2 => {
                      io.to(socket.id).emit('first message', { "chatData": data1, "messageData": data2 });
                    })
                    .catch(err => {
                      console.log(err.message);
                    });
                }

              })
              .catch(err => {
                console.log(err.message);
              });

          } else {
            console.log("new user start the chatting.............");
            //insert client details
            const clientData = {
              store_id: data.storeId,
              session_id: socket.id,
              client_ip: socket.handshake.address,
              name: data.name,
              email: data.email,
              mobile_no: data.contact_no,
              status: "Online",
              message: data.first_message,
              createdAt: datestring
            };

            await models.chatUsers.create(clientData)
              .then(async data2 => {
                clients[socket.id] = data2.id;
                //insert client chat message 
                if (data.first_message) {
                  const messageData = {
                    store_id: data2.store_id,
                    chatUserId: data2.id,
                    type: "receiver",
                    adminUserId: data2.id,
                    adminUserName: data2.name,
                    message: data.first_message,
                    msg_read: "no",
                    page_url: socket.handshake.headers.referer
                  };
                  await newMessageInsert(messageData);
                }
                io.to(socket.id).emit('first message', { "chatData": data2, "messageData": [] });
              })
              .catch(err => {
                console.log(err.message);
              });
          }
        })
        .catch(err => {
          console.log(err.message);
        });

    });

    //admin socket connection
    socket.on('admin visit', (data) => {
      console.log("admin socket connection id ==============> ", socket.id);
      adminSocketid = socket.id;
      adminStatus = "online";
    });

    socket.on('chat message', async (msg) => {
      //insert chat message 
      const messageData = {
        chatUserId: msg.userId,
        store_id: msg.storeId,
        type: msg.msgType,
        adminUserId: msg.senderId,
        adminUserName: msg.msgSenderName,
        message: msg.clientMsg,
        page_url: socket.handshake.headers.referer
      };
      await models.chatMessages.create(messageData)
        .then(async data3 => {
          if (msg.msgType == "receiver") {
            console.log("admin socket id ============> ", adminSocketid);

            await checkUserChat(msg.userId, msg.storeId, adminStatus);

            if (adminSocketid != "") {
              socket.broadcast.to(adminSocketid).emit('chat message', { "message": msg.clientMsg, "senderName": msg.msgSenderName, "userId": msg.userId });  //sending message to all except the sender
            }

            var socket_id = Object.keys(clients).find(key => clients[key] == msg.userId);
            console.log("user socket id already have ===================> ", socket_id);
            if (typeof socket_id === "undefined") {
              clients[socket.id] = msg.userId;
            }

          } else {

            adminStatus = "online";
            var socket_id = Object.keys(clients).find(key => clients[key] == msg.userId);

            if (adminSocketid == "") {
              adminSocketid = socket.id;
            }

            console.log('user object =======> ', clients);
            console.log('client socket id ============> ', socket_id);

            socket.broadcast.to(socket_id).emit('chat message', { "message": msg.clientMsg, "senderName": msg.msgSenderName });  //sending message to all except the sender
          }
        })
        .catch(err => {
          console.log(err.message);
        });
    });

    //when client click the start button
    socket.on('check message', async (data) => {
      //fetch client details
      await models.chatUsers.findAll({
        where: {
          id: data.user_id,
          store_id: data.store_id
        },
        include: [{
          model: models.chatMessages
        }]
      })
        .then(async data1 => {
          if (data1.length > 0) {
            clients[socket.id] = data1[0].id;
            console.log("user available object ===================> ", clients);
            await userStatusUpdate(data1[0].id, "Online", socket.id);
          }

          io.to(socket.id).emit('check client chat data', { "data": data1 });
        })
        .catch(err => {
          console.log(err.message);
        });
    });

    //socket disconnected
    socket.on('disconnect', async () => {
      if (socket.id == adminSocketid) {
        console.log('Admin disconnected id..............', socket.id);
        adminStatus = "offline";
      } else {
        var user_id = clients[socket.id];
        console.log('User disconnected id..............', socket.id);
        await userStatusUpdate(user_id, "Offline");
        // remove saved socket from users object
        delete clients[socket.id];
      }
    });

  });
}

exports.userChats = async (req, res) => {
  var storeId = req.body.data.storeId;
  var userName = req.body.data.userName;

  if (userName && userName != 'undefined' && userName != '') {
    await models.chatUsers.findAll({
      where: {
        store_id: storeId,
        name: { [Op.like]: `%${userName}%` },
      },
      order: [['status', 'ASC'], ['id', 'DESC']]
    })
      .then(async data => {
        if (data.length > 0) {

          const list = data.map((val) => {
            return Object.assign(
              {},
              {
                id: val.id,
                store_id: val.store_id,
                session_id: val.session_id,
                client_ip: val.client_ip,
                name: val.name,
                email: val.email,
                mobile_no: val.mobile_no,
                message: val.message,
                profile_pic: val.profile_pic,
                status: val.status,
                createdAt: val.createdAt,
                updatedAt: val.updatedAt,
              }
            );
          });
          for (let i = 0; i < list.length; i++) {
            await models.chatMessages.findAll({
              where: {
                chatUserId: list[i].id,
                store_id: storeId,
                msg_read: "no",
                type: "receiver"
              }
            })
              .then(async data1 => {
                list[i].msgReadCount = data1.length;
              })

          }
          // console.log(list);
          return res.status(200).send({ data: { success: true, user: list, message: "success" }, errorNode: { errorCode: 0, errorMsg: "" } });
        } else {
          return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: 'error' } });
        }
      })
      .catch(err => {
        return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: err } });
      });

  } else {

    await models.chatUsers.findAll({
      where: {
        store_id: storeId
      },
      order: [['status', 'ASC'], ['id', 'DESC']]
    })
      .then(async data => {
        if (data.length > 0) {

          const list = data.map((val) => {
            return Object.assign(
              {},
              {
                id: val.id,
                store_id: val.store_id,
                session_id: val.session_id,
                client_ip: val.client_ip,
                name: val.name,
                email: val.email,
                mobile_no: val.mobile_no,
                message: val.message,
                profile_pic: val.profile_pic,
                status: val.status,
                createdAt: val.createdAt,
                updatedAt: val.updatedAt,
              }
            );
          });
          for (let i = 0; i < list.length; i++) {
            await models.chatMessages.findAll({
              where: {
                chatUserId: list[i].id,
                store_id: storeId,
                msg_read: "no",
                type: "receiver"
              }
            })
              .then(async data1 => {
                list[i].msgReadCount = data1.length;
              })

          }
          // console.log(list);
          return res.status(200).send({ data: { success: true, user: list, message: "success" }, errorNode: { errorCode: 0, errorMsg: "" } });
        } else {
          return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: 'error' } });
        }
      })
      .catch(err => {
        return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: err } });
      });
  }
}

exports.userMessage = async (req, res) => {
  var storeId = req.body.data.storeId;
  var userId = req.body.data.userId;

  let clientMsg = {
    msg_read: "yes"
  };
  models.chatMessages.update(clientMsg, {
    where: { chatUserId: userId, store_id: storeId }
  })
    .then(async num => {
    })
    .catch(err => {
      console.log(err.message);
    });
  models.chatMessages.findAll({
    where: {
      chatUserId: userId,
      store_id: storeId
    }
  })
    .then(async data => {

      if (data.length > 0) {
        return res.status(200).send({ data: { success: true, user: data, message: "success" }, errorNode: { errorCode: 0, errorMsg: "" } });
      } else {
        return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: 'error' } });
      }

    })
    .catch(err => {
      return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: err } });
    });
}

exports.userReadMessage = async (req, res) => {
  var storeId = req.body.data.storeId;
  var userId = req.body.data.userId;

  let clientMsg = {
    msg_read: "yes"
  };
  await models.chatMessages.update(clientMsg, {
    where: { chatUserId: userId, store_id: storeId }
  })
    .then(async num => {
      return res.status(200).send({ data: { success: true, user: num, message: "success" }, errorNode: { errorCode: 0, errorMsg: "" } });
    })
    .catch(err => {
      return res.status(200).send({ data: { success: false, user: [], message: "Something went wrong" }, errorNode: { errorCode: 1, errorMsg: err } });
    });
}

async function checkUserChat(userId, storeId, adminStatus) {

  models.chatMessages.findAll({
    where: {
      chatUserId: userId,
      store_id: storeId
    },
    order: [['id', 'DESC']],
    limit: 2
  })
    .then(async data => {
      if (data.length > 0) {
        var userMsgLength = 0;
        data.forEach(element => {
          console.log(element.dataValues.type);
          if (element.dataValues.type == 'receiver') {
            userMsgLength++;
          }
        });
        if (userMsgLength > 1) {
          if (adminStatus == 'offline') {
            await fetchUserNewChat(userId, storeId);
          }

        }
      }
    })
    .catch(err => {
      console.log(err);
    });
}

async function fetchUserNewChat(userId, storeId) {
  await models.chatUsers.findOne({
    where: {
      id: userId,
      store_id: storeId
    }
  })
    .then(async userData => {
      await models.chatMessages.findAll({
        where: {
          chatUserId: userId,
          store_id: storeId,
          msg_read: "no"
        }
      })
        .then(async userChatdata => {
          // var adminData = await fetchAdminEmail(storeId);
          var siteSeGrsDetails = await models.siteSettingsGroups.findOne({ attributes: ['id', 'storeId'], where: { groupTitle: "Mail Services", storeId: storeId, status: "Yes" } });
          if (siteSeGrsDetails) {
            var mailServiceMail = await models.siteSettings.findAll({ attributes: ['email'], where: { storeId: siteSeGrsDetails.storeId, siteSettingsGroupId: siteSeGrsDetails.id } });
            var storeData = await models.stores.findOne({ attributes: ['storeName'], where: { id: siteSeGrsDetails.storeId } });
            if (mailServiceMail.length > 0) {
              var emails = '';
              mailServiceMail.forEach(element => {
                if (emails != '') {
                  emails += `, ${element.email}`;
                } else {
                  emails = element.email;
                }
              });

              helper.chatMailSend(emails, storeData.storeName, userData, userChatdata);
            }
          }

        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
}

async function userStatusUpdate(userId, uStatus, socketId = null) {
  var client = { status: uStatus };
  if (socketId != null && socketId != "") {
    var client = { status: uStatus, session_id: socketId };
  }

  models.chatUsers.update(client, {
    where: { id: userId }
  })
}

async function newMessageInsert(messageData) {
  var data = models.chatMessages.create(messageData);
  return data;
}

async function fetchAdminEmail(store_id) {

  var adminData = await models.admins.findOne({
    where: {
      storeId: store_id
    }
  })
  return adminData;
}