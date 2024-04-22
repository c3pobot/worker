'use strict'
const getGuildId = require('./getGuildId')
const queryArenaPlayers = require('./queryArenaPlayers')
const queryGuild = require('./queryGuild')

module.exports = async(opt = {})=>{
  let guildId = await getGuildId(opt)
  if(!guildId) return
  let gObj = await queryGuild(guildId, false)
  if(!gObj?.guild?.member?.length > 0) return
  return await queryArenaPlayers({players: gObj.guild.member, detailsOnly: true})
}
