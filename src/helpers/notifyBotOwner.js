'use strict'
const { botSettings } = require('./botSettings')
const mongo = require('mongoclient')
const { SendMsg, SendDM } = require('./discordmsg')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = async(content)=>{
  if(botSettings?.reportSId && botSettings?.reportChId){
    await SendMsg({chId: obj.reportChId}, content)
    return
  }
  if(BOT_OWNER_ID) SendDM(BOT_OWNER_ID, content)
}
