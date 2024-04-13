'use strict'
module.exports = async(obj, opt = [], guild)=>{
  try{
    let msg2send = {content: 'There are no configured raid announcments'}
    if(guild.raids && guild.raids.length > 0){
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: guild.guildName + " Raids announcement(s) configuration",
        fields: []
      }
      for(let i in guild.raids){
        let role
        if(guild.raids[i].sId && guild.raids[i].roleId) role = await HP.GetRole(guild.raids[i].sId, guild.raids[i].roleId)
        const tempField = {
          name: (guild.raids[i].name ? guild.raids[i].name:guild.raids[i].id),
          value: ''
        }
        tempField.value += 'Channel   : <#'+guild.raids[i].chId+'>\n'
        if(guild.raids[i].roleId){
          tempField.value += 'Role      : @'+(role && role.name ? role.name:guild.raids[i].roleId)+'\n'
        }else{
          tempField.value += 'Role      : none\n'
        }
        tempField.value += 'Hold Time : '+(guild.raids[i].hold > 0 ? guild.raids[i].hold+' mins':'none')+'\n'
        embedMsg.fields.push(tempField)
      }
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
