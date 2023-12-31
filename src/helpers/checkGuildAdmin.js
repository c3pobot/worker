'use strict'
const GetGuildId = require('./getGuildId')
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = [], guild)=>{
  try{
    let auth, server, guildId
    if(!guild){
      let pObj = await GetGuildId({dId: obj?.member?.user?.id}, {}, opt)
      if(pObj?.guildId) guildId = pObj?.guildId
    }
    if(guildId) server = (await mongo.find('discordServer', {_id: obj.guild_id}, {admin: 1, guilds: 1}))[0]
    if(server?.admin?.length > 0 && server?.guilds?.filter(x=>x.guildId == guildId).length > 0){
      for(let i in server.admin){
        if(obj?.member?.roles?.filter(x=>x == server.admin[i].id).length > 0){
          auth = true
          break;
        }
      }
    }
    return { auth: auth, guildId: guildId }
  }catch(e){
    throw(e)
  }
}
