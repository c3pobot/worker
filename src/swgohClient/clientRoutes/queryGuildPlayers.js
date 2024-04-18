'use strict'
const getGuildId = require('./getGuildId')
const queryArenaPlayers = require('./queryArenaPlayers')
const queryGuild = require('./queryGuild')

module.exports = async(opt = {})=>{
  try{
    let guildId = await getGuildId(opt)
    if(!guildId) return
    let gObj = await queryGuild(guildId, false)
    if(!gObj?.guild?.member?.length > 0) return
    return await queryArenaPlayers(gObj.guild.member, true)
  }catch(e){
    log.error(e)
  }
}
