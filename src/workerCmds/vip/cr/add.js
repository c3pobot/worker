'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, limit = 100, cr = []
    let trigger = GetOptValue(opt, 'trigger')
    if(trigger) trigger = trigger.toString().trim().toLowerCase()
    let response = GetOptValue(opt, 'response')
    let crca = GetOptValue(opt, 'anywhere', 0)
    if(trigger && response){
      const vip = (await mongo.find('vip', {_id: obj.member.user.id}))[0]
      if(vip && vip.crLimit) limit = vip.crLimit
      const localCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]
      if(localCR && localCR.cr) cr = localCR.cr
      if(+cr.length >= limit){
        msg2send.content = 'You are limited to **'+limit+'** and you have **'+cr.length+'** custom reactions'
      }else{
        if(cr.filter(x=>x.trigger == trigger).length > 0){
          msg2send.content = 'a custom reaction for **'+trigger+'** already exists'
        }else{
          const id = await mongo.next('reactions', {_id: obj.member.user.id}, 'crIndex')
          if(id >= 0){
            await mongo.push('reactions', {_id: obj.member.user.id}, {cr: {
              id: id,
              anywhere: crca,
              trigger: trigger,
              response: response
            }})
          }
          const embedMsg = {
            color: 15844367,
            title: 'Personal Custom Reaction',
            description: '**New Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
          }
          embedMsg.description += 'Trigger anywhere : \n'+(crca > 0 ? 'Yes':'No')
          msg2send.embeds = [embedMsg]
          msg2send.content = null
        }
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
