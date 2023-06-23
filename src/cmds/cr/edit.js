'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'That is not a custom reaction for this server'}, tempObj
    let id = await HP.GetOptValue(opt, 'id')
    let trigger = await HP.GetOptValue(opt, 'trigger')
    let response = await HP.GetOptValue(opt, 'response')
    let crca = await HP.GetOptValue(opt, 'anywhere')
    if(trigger) trigger = trigger?.toString().toLowerCase()
    if(+id >= 0) id = +id
    const lCR = (await mongo.find('reactions', {_id: obj.guild_id}))[0]
    if(lCR && lCR.cr && lCR.cr.find(x=>x.id == id)) tempObj = Object.assign({}, lCR.cr.find(x=>x.id == id))
    if(tempObj){
      if(trigger && lCR.cr.filter(x=>x.trigger == trigger && x.id != id).length > 0){
        msg2send.content = 'There is already another reaction for **'+trigger+'**'
      }else{
        const guild = await HP.GetGuild(obj.guild_id)
        if(trigger) tempObj.trigger = trigger
        if(response) tempObj.response = response
        if(crca >= 0) tempObj.anywhere = crca
        await mongo.set('reactions', {_id: obj.guild_id, 'cr.id': id}, {'cr.$': tempObj})
        const embedMsg = {
          color: 15844367,
          title: (guild ? guild.name+' ':'')+'Custom Reaction',
          description: '**Custom Reaction Updated**\n#'+id+'\n\n**Trigger** : \n'+tempObj.trigger+'\n\n**Response** : \n'+tempObj.response+'\n\n'
        }
        embedMsg.description += 'Trigger anywhere : \n'+(tempObj.anywhere > 0 ? 'Yes':'No')
        msg2send.embeds = [embedMsg]
        msg2send.content = null
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
