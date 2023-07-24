'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
const { GetGuild } = require('discordapiclient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error finding that server'}
    let sId = await GetOptValue(opt, 'id', obj.guild_id)
    if(sId){
      msg2send.content = 'Error finding guild **'+sId+'**'
      const guild = await GetGuild(sId)
      if(guild && guild.name){
        await mongo.set('discordServer', {_id: sId}, {basicStatus: 0})
        msg2send.content = guild.name+' was disabled from usage of bot basic commands'
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
