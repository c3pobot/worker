'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let trigger, response, crca = 0, msg2send = {content: 'You did not provide the correct information'}
    if(opt.find(x=>x.name == 'trigger')) trigger = opt.find(x=>x.name == 'trigger').value.trim().toLowerCase()
    if(opt.find(x=>x.name == 'response')) response = opt.find(x=>x.name == 'response').value
    if(opt.find(x=>x.name == 'anywhere')) crca = opt.find(x=>x.name == 'anywhere').value
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
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
