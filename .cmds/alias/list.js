'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'There are no aliases for this server', components: []}, startIndex = 0
    if(obj.confirm && obj.confirm.index) startIndex = obj.confirm.index
    const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
    if(guild && guild.unitAlias && guild.unitAlias.length > 0){
      msg2send.content = null
      const alias = await sorter([{column: 'alias', order: 'ascending'}], guild.unitAlias)
      const embedMsg = {
        color: 15844367,
        title: 'Server Alias List',
        description: '```'
      }
      let aliasCount = 0
      for(let i = startIndex;i<alias.length;i++){
        if(aliasCount < 25){
          embedMsg.description += alias[i].alias+' : '+alias[i].nameKey+'\n'
          aliasCount++
        }else{
          break;
        }
      }
      embedMsg.title += ' ('+(aliasCount)+'/'+alias.length+')'
      embedMsg.description += '```'
      msg2send.embeds = [embedMsg]
      if(startIndex){
        msg2send.components.push({
          type: 1,
          components: [
            {
              type: 2,
              label: 'Previous',
              style: 1,
              custom_id: JSON.stringify({id: obj.id, index: startIndex - 25})
            }
          ]
        })
      }
      if(+alias.length > (startIndex + aliasCount)){
        if(msg2send.components.length == 0) msg2send.components.push({type: 1, components: []})
        msg2send.components[0].components.push({
          type: 2,
          label: 'Next',
          style: 1,
          custom_id: JSON.stringify({id: obj.id, index: (aliasCount + startIndex)})
        })
      }
    }
    if(msg2send.components.length > 0){
      HP.ButtonPick(obj, msg2send)
    }else{
      HP.ReplyMsg(obj, msg2send)
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
