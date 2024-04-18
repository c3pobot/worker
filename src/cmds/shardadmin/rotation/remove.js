'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'that player is not part of the rot schedule'}, dId, allyCode, player
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}
  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(!rots || !rot[schedule]) return { content: `**${schedule}** is not a valid rotation schedule...`}
  if(!rots[schedule]?.players || rots[schedule]?.players.length === 0) return { content: `**${schedule}** does not have any players...`}
  let playerName = getOptValue(opt, 'player')
  if(playerName?.startsWith('<@')){
    dId = playerName.replace(/[<@!>]/g, '')
  }else{
    allyCode = playerName?.replace(/-/g, '')
  }
  if(dId) player = rots[schedule]?.players?.find(x=>x.discord?.replace(/[<@!>]/g, '') === dId)
  if( allyCode) player = (await mongo.find('shardRankCache', {_id: allyCode+'-'+shard._id}))[0]
  if(player?.name) playerName = player.name
  if(playerName && rots[schedule].players.filter(x=>x.name == playerName).length > 0){
    let rmvPlayer = Object.assign({}, rots[schedule].players.find(x=>x.name == playerName))
    await mongo.pull('shardRotations', {_id: shard._id}, {[schedule+'.players']: rmvPlayer})
    msg2send.content = '**'+rmvPlayer.name+'** was removed from **'+schedule+'** rotation'
  }
  return msg2send
}
