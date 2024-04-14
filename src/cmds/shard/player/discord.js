'use strict'
const { addPlayer } = require('./helper')
const { getOptValue, checkShardAdmin } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let auth = +shard.allowAll || 0, msg2send = {content: 'there was an error with the provided data'}, shardPlayer
  if(!obj?.member?.user?.id) return msg2send
  msg2send.content = 'You did not provide a valid allyCode'
  let allyCode = getOptValue(opt, 'allycode')
  if(allyCode){
    allyCode = allyCode.toString().replace(/-/g, '').trim()
    msg2send.content = 'Player with allyCode **'+allyCode+'** is not part of the shard list'
    shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
  }
  if(!shardPlayer){
    if(!auth) auth = await checkShardAdmin(obj, shard)
    if(auth){
      let pObj = await swgohClient.post('getArenaPlayer', {allyCode: allyCode}, null)
      if(pObj?.allyCode) await addPlayer(shard, pObj, null)
      shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    }
  }
  if(shardPlayer){
    await mongo.set('shardPlayers', {_id: allyCode+'-'+shard._id}, {dId: obj.member.user.id})
    msg2send.content = 'allyCode '+allyCode+' has been linked to your discord id for shard notifications'
  }
  return msg2send
}
