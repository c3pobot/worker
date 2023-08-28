'use strict'
const BOT_DISCORD_ID = process.env.DISCORD_CLIENT_ID
const botRequest = require('botrequest')
module.exports = async(sId, dId)=>{
  try{
    if(!sId) return
    let obj = {sId: sId, dId: dId}
    if(!obj.dId) obj.dId = BOT_DISCORD_ID
    const res = await botRequest('getGuildMember', obj)
    return res?.perms
  }catch(e){
    throw(e);
  }
}
