'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error finding that server'}
    let sId = await HP.GetOptValue(opt, 'id', obj.guild_id)
    if(sId){
      msg2send.content = 'Error finding guild **'+sId+'**'
      const guild = await HP.GetGuild(sId)
      if(guild && guild.name){
        await mongo.set('discordServer', {_id: sId}, {basicStatus: 0})
        msg2send.content = guild.name+' was disabled from usage of bot basic commands'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
