'use strict'
const { sendMsg } = require('./discordmsg')
module.exports = async(obj = {})=>{
  if(!obj.chId) return
  return await sendMsg({ sId: obj.sId, chId: obj.chId }, { embeds: [{ description: "Placeholder", color: 15844367 }] })
}
