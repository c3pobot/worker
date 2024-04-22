'use strict'
const getArenaPlayers = require('./getArenaPlayers')
const queryGuild = require('./queryGuild')
module.exports = async(opt = {})=>{
  if(!opt.guildId) return
  let data = await queryGuild({ guildId: opt.guildId })
  if(data?.member?.length > 0) return await getArenaPlayers({ players: data.member })
}
