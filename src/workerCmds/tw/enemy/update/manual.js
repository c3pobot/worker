'use strict'
const { mongo, CheckGuildAdmin, GetGuildId, GetOptValue, ReplyMsg } = require('helpers')
const TWReport = require('../../report')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: "You must provide an allyCode for opponent guild"}, enemyId
    let allyCode = GetOptValue(opt, 'allycode')
    let auth = await CheckGuildAdmin(obj, opt, null)
    if(!auth?.auth) msg2send.content = 'This command is only avaliable to guild Admins'
    let guildId = auth?.auth
    if(auth?.auth && allyCode){
      msg2send.content = '**'+opt.find(x=>x.name == 'allycode').value+'** is not a valid allyCode'
      allyCode = allyCode.replace(/-/g, '').trim()
      let eObj = await GetGuildId({}, { allyCode: allyCode }, [])
      if(eObj?.guildId){
        enemyId = eObj.guildId
        msg2send.content = 'You do not have allycode linked to discordId'
      }
    }
    if(enemyId && guildId){
      await mongo.set('twStatus', {_id: guildId}, {enemy: enemyId, joined: []})
      await TWReport(obj, opt, true)
      return
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
