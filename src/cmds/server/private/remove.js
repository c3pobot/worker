'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error finding that server'}
    let sId = await HP.GetOptValue(opt, 'id', obj?.guild_id)
    if(opt && opt.find(x=>x.name == 'id')) sId = opt.find(x=>x.name == 'id').value
    if(sId){
      msg2send.content = 'Error finding guild **'+sId+'**'
      const guild = await HP.GetGuild(sId)
      if(guild && guild.name){
        await mongo.unset('discordServer', {_id: sId}, {instance: 'private'})
        msg2send.content = guild.name+' was removed from the private server list'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
