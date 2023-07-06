'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    let trigger = await GetOptValue(opt, 'trigger')
    let response = await GetOptValue(opt, 'response')
    let crca = await GetOptValue(opt, 'anywhere' 0)
    crca = +crca
    if(trigger) trigger = trigger?.toString().toLowerCase()
    if(trigger && response){
      const lCR = (await mongo.find('reactions', {_id: 'global'}))[0]
      if(lCR && lCR.cr && lCR.cr.filter(x=>x.trigger == trigger).length > 0){
        msg2send.content = 'A custom reaction for **'+trigger+'** already exists'
      }else{
        const id = await mongo.next('reactions', {_id: 'global'}, 'crIndex')
        if(id >= 0){
          await mongo.push('reactions', {_id: 'global'}, {cr: {
            id: id,
            anywhere: crca,
            trigger: trigger,
            response: response,
          }})
          const embedMsg = {
            color: 15844367,
            title: 'Global Custom Reaction',
            description: '**New  Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
          }
          embedMsg.description += 'Trigger anywhere : \n'+(crca > 0 ? 'Yes':'No')
          msg2send.embeds = [embedMsg]
          msg2send.content = null
        }else{
          msg2send.content = 'Error setting custom reaction'
        }
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
