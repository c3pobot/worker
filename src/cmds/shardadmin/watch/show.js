'use strict'
const mongo = require('mongoclient')
const { getRole } = require('src/helpers')
const { getChannel } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(!shard.watch) return { content: 'there are no role watches' }

  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!shard.watch[allyCode]) return { content: `there are no role watches for ${allyCode}` }

  if(allyCode){
    let pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    if(!pObj) return { content: '**'+allyCode+'** has not been added to the shard list' }

    let embedMsg = {
      color: 15844367,
      description: pObj.name+' group watch info\n```\n',
    }
    let role = await getRole(shard.sId, shard.watch[allyCode].roleId)
    let channel = await getChannel(shard.watch[allyCode].chId)
    embedMsg.description += 'allyCode   :'+shard.watch[allyCode].allyCode+'\n'
    embedMsg.description += 'Role       : @'+(role ? role.name:'UNKNOWN')+'\n'
    embedMsg.description += 'Channel    : #'+(channel ? channel.name:'UNKNOWN')+'\n'
    embedMsg.description += 'startTime  : '+shard.watch[allyCode].startTime+'\n'
    if(shard.watch[allyCode].startRank) embedMsg.description += 'Start Rank : '+shard.watch[allyCode].startRank+'\n'
    embedMsg.description += 'Direction  : '+shard.watch[allyCode].moveDir+'\n'
    embedMsg.description += '```'
    return { content: null, embeds: [embedMsg] }
  }

  let embedMsg = {
    color: 15844367,
    description: obj.guild?.name+'Payout @role watches',
    fields: []
  }
  let tempObj = {}
  for(let i in shard.watch){
    if(!tempObj[shard.watch[i].roleId]) tempObj[shard.watch[i].roleId] = {roleId: shard.watch[i].roleId, players: []}
    if(tempObj[shard.watch[i].roleId]) tempObj[shard.watch[i].roleId].players.push(shard.watch[i])
  }
  let roleArray = Object.values(tempObj)
  for(let i in roleArray){
    let role = await getRole(shard.sId, roleArray[i].roleId)
    let tempMsg = {
      name: '@'+(role ? role.name:'UNKNOWN'),
      value: '```\nallyCode  : Dir  : T  : R  : Name\n'
    }
    for(let p in roleArray[i].players){
      let pObj = (await mongo.find('shardPlayers', {_id: roleArray[i].players[p].allyCode+'-'+shard._id}))[0]
      if(!pObj) continue
      tempMsg.value += roleArray[i].players[p].allyCode+' : '+roleArray[i].players[p].moveDir.padEnd(4, ' ')+' : '+(roleArray[i].players[p].startTime ? roleArray[i].players[p].startTime.toString().padStart(2, '0'):'NA')+' : '+(roleArray[i].players[p].startRank > 0 ? roleArray[i].players[p].startRank.toString().padStart(2, ' '):'NA')+' : '+pObj.name+'\n'
    }
    tempMsg.value += '```'
    embedMsg.fields.push(tempMsg)
  }
  return { content: null, embeds: [embedMsg] }
}
