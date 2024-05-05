'use strict'
const mongo = require('mongoclient')
const showEnemyWatch = require('./show')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let tempEnemy = {
    emoji: [],
    allyCodes: [],
    startRank: 50,
    status: 'once',
    notify: 1,
    chId: shard.logChannel
  }
  if(shard.enemyWatch) tempEnemy = shard.enemyWatch
  let allyCode = opt.allycode?.value?.toString()?.replace(/-/g, ''), emoji = opt.emoji?.value

  if(allyCode){
    let pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    if(!pObj?.allyCode) return { content: `${allyCode} is not in the shard list` }

    if(pObj?.allyCode && tempEnemy.allyCodes.filter(x=>x === +allyCode).length === 0) tempEnemy.allyCodes.push(+allyCode)
  }
  if(emoji && tempEnemy.emoji.filter(x=>x === emoji).length === 0) tempEnemy.emoji.push(emoji)
  await mongo.set('payoutServers', { _id: shard._id }, { enemyWatch: tempEnemy })
  shard.enemyWatch = tempEnemy
  return await ShowEnemyWatch(obj, shard, opt)
}
