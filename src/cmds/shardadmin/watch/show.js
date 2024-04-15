'use strict'
const mongo = require('mongoclient')
const { getOptValue, getRole } = require('src/helpers')
const { GetChannel, GetGuild } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'There are no role watches'}
  let allyCode = getOptValue(opt, 'allycode')?.toString()?.replace(/-/g, '')
  if(allyCode){
    msg2send.content = 'There is not a role watch for **'+allyCode+'**'
    let pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    if(!pObj) msg2send.content = '**'+allyCode+'** has not been added to the shard list'
    if(pObj && shard.watch && shard.watch[allyCode]){
      let embedMsg = {
        color: 15844367,
        description: pObj.name+' group watch info\n```\n',
      }
      let role = await getRole(shard.sId, shard.watch[allyCode].roleId)
      let channel = await GetChannel(shard.watch[allyCode].chId)
      embedMsg.description += 'allyCode   :'+shard.watch[allyCode].allyCode+'\n'
      embedMsg.description += 'Role       : @'+(role ? role.name:'UNKNOWN')+'\n'
      embedMsg.description += 'Channel    : #'+(channel ? channel.name:'UNKNOWN')+'\n'
      embedMsg.description += 'startTime  : '+shard.watch[allyCode].startTime+'\n'
      if(shard.watch[allyCode].startRank) embedMsg.description += 'Start Rank : '+shard.watch[allyCode].startRank+'\n'
      embedMsg.description += 'Direction  : '+shard.watch[allyCode].moveDir+'\n'
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
  }
  if(!allyCode && shard.watch){
    let guild = await GetGuild(shard.sId)
    let embedMsg = {
      color: 15844367,
      description: (guild ? guild.name+' ':'')+'Payout @role watches',
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
        if(pObj){
          tempMsg.value += roleArray[i].players[p].allyCode+' : '+roleArray[i].players[p].moveDir.padEnd(4, ' ')+' : '+(roleArray[i].players[p].startTime ? roleArray[i].players[p].startTime.toString().padStart(2, '0'):'NA')+' : '+(roleArray[i].players[p].startRank > 0 ? roleArray[i].players[p].startRank.toString().padStart(2, ' '):'NA')+' : '+pObj.name+'\n'
        }
      }
      tempMsg.value += '```'
      embedMsg.fields.push(tempMsg)
    }
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
