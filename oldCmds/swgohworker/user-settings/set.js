'use strict'
const ShowSettings = require('./show')
module.exports = async(obj={}, opt=[])=>{
  try{
    let settings = {}, dObj, msg2send = {content: 'Error running the command'}
    let dId = obj.member.user.id
    let type = await HP.GetOptValue(opt, 'type', 'ga')
    if(dId) dObj = (await mongo.find('discordId', {_id: obj.member.user.id}))[0]
    if(dObj?.settings) settings = dObj.settings
    if(!dId) settings = {}
    if(settings){
      if(!settings[type]) settings[type] = {}
      for(let i in opt){
        if(opt[i].name !== 'type') settings[type][opt[i].name] = opt[i].value
      }
      await mongo.set('discordId', {_id: dId}, {settings: settings})
      await ShowSettings(obj, opt)
    }
    if(!settings) await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
