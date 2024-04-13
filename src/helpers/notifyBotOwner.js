'use strict'
const mongo = require('mongoclient')
const { SendMsg, SendDM } = require('./discordmsg')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = async(content)=>{
  let obj = (await mongo.find('botSettings', {_id: '1'}))[0]
  if(obj?.reportSId && obj?.reportChId){
    await SendMsg({chId: obj.reportChId}, content)
    return
  }
  if(BOT_OWNER_ID) SendDM(BOT_OWNER_ID, content)
}
