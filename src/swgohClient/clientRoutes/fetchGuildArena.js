'use strict'
const log = require('logger')
const getArenaPlayers = require('./getArenaPlayers')
const queryGuild = require('./queryGuild')
module.exports = async(opt = {})=>{
  try{
    if(!opt.guildId) return
    let data = await queryGuild(opt.guildId)
    if(data?.guild?.member?.length > 0) return await getArenaPlayers({ players: obj.guild.member })
  }catch(e){
    throw(e)
  }
}
