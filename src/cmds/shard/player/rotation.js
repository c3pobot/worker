'use strict'
const mongo = require('mongoclient')

const { showRotationSchedule } = require('src/helpers')
const { getGuild } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: "There are not shard rotation schedules"}
  let schedule = opt.schedule?.value?.toString()?.trim()?.toUpperCase()
  let rots = (await mongo.find('shardRotations', { _id: shard._id }, {_id: 0, TTL: 0} ))[0]
  if(!rots) return { content: "There are not shard rotation schedules" }

  if(rots[schedule]){
    let content = await showRotationSchedule(obj, rots[schedule], shard, true)
    if(!rots[schedule].poOffSet) content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
    return { content: content }
  }

  let guild = await GetGuild(shard.sId)
  let content = '>>> '+(guild ? guild.name+' ':'')+'Shard rotation schedules\n```\n'
  for(let i in rots) content += rots[i].id+' ('+(rots[i].players ? rots[i].players.length:0)+')\n'
  content += '```'
  return { content: content }
}
