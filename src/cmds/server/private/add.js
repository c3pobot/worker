'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error finding that server'}
    let sId = await HP.GetOptValue(opt, 'id', obj.guild_id)
    if(sId){
      msg2send.content = 'Error finding guild **'+sId+'**'
      const guild = await HP.GetGuild(sId)
      if(guild && guild.name){
        await mongo.set('discordServer', {_id: sId}, {instance: 'private'})
        const tempObj = await mongo.find('discordServer', {instance: 'private'}, {_id: 1})
        if(tempObj){
          const tempSvr = tempObj.map(x=>x._id)
          await redis.set('privateServers', tempSvr)
        }
        msg2send.content = guild.name+' was added to the private server list'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
