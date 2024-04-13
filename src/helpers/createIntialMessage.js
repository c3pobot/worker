'use strict'
const { SendMsg } = require('./discordmsg')
module.exports = async(obj)=>{
  return await SendMsg(obj, {embeds: [{description: "Placeholder", color: 15844367}]})
}
