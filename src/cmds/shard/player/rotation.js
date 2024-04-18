'use strict'
const mongo = require('mongoclient')
const { getOptValue, showRotationSchedule } = require('src/helpers')
const { GetGuild } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: "There are not shard rotation schedules"}
  let rots = (await mongo.find('shardRotations', {_id: shard._id}, {_id: 0, TTL: 0} ))[0]
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  if(!rots) return msg2send
  msg2send.content = `Rotation schedule **${schedule}** not found`
  if(schedule && rots[schedule]){
    msg2send.content = await showRotationSchedule(obj, rots[schedule], shard, true)
    if(!rots[schedule].poOffSet) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  }
  if(!schedule){
    let guild = await GetGuild(shard.sId)
    msg2send.content = '>>> '+(guild ? guild.name+' ':'')+'Shard rotation schedules\n```\n'
    for(let i in rots) msg2send.content += rots[i].id+' ('+(rots[i].players ? rots[i].players.length:0)+')\n'
    msg2send.content += '```'
  }
  return msg2send
}
