'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let trigger, response, crca = 0, msg2send = {content: 'You did not provide the correct information'}
    if(opt.find(x=>x.name == 'trigger')) trigger = opt.find(x=>x.name == 'trigger').value.trim().toLowerCase()
    if(opt.find(x=>x.name == 'response')) response = opt.find(x=>x.name == 'response').value
    if(opt.find(x=>x.name == 'anywhere')) crca = opt.find(x=>x.name == 'anywhere').value
    if(trigger && response){
      const guild = await MSG.GetGuild(obj.guild_id)
      const lCR = (await mongo.find('reactions', {_id: obj.guild_id}))[0]
      if(lCR && lCR.cr && lCR.cr.filter(x=>x.trigger == trigger).length > 0){
        msg2send.content = 'A custom reaction for **'+trigger+'** already exists'
      }else{
        const id = await mongo.next('reactions', {_id: obj.guild_id}, 'crIndex')
        if(id >= 0){
          await mongo.push('reactions', {_id: obj.guild_id}, {cr: {
            id: id,
            anywhere: crca,
            trigger: trigger,
            response: response,
          }})
          const embedMsg = {
            color: 15844367,
            title: (guild ? guild.name+' ':'')+'Custom Reaction',
            description: '**New Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
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
