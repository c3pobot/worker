'use strict'
const mongo = require('mongoclient')
const { getId } = require('src/helpers/botRequest')
const { getGuild, getGuildMember } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let usr
  let playerCount = await mongo.count('shardPlayers', {shardId: shard._id}, {allyCode: 1})
  if(shard.patreonId) usr = await getGuildMember(shard.sId, shard.patreonId)
  let guild = await getGuild(shard.sId)
  let embedMsg = {
    title: (guild && guild.guildName ? guild.guildName+' ':'')+'Payout Server info',
    color: 15844367,
    fields: []
  }
  let basicField = {
    name: 'Basic Info',
    value: '```\n'
  }
  basicField.value += 'ID         : '+shard._id+'\n'
  basicField.value += 'sId        : '+shard.sId+'\n'
  basicField.value += 'Players    : '+(playerCount || 0)+'\n'
  basicField.value += 'Shard Num  : '+getId(shard.sId)+'\n'
  if(shard.patreonId) basicField.value += 'Patreon    : @'+(usr?.user?.username || 'UNKNOWN')+'\n'
  basicField.value += 'PO Sort    : '+shard.poSort+'\n'
  basicField.value += 'Group Sort : '+shard.sort+'\n'
  basicField.value += 'Rank Sort  : '+(shard.rankSort ? shard.rankSort:'ascending')+'\n'
  basicField.value += 'Type       : '+(shard.type == 'char' ? 'Squad':'Fleet')+'\n'
  basicField.value += '```'
  embedMsg.fields.push(basicField)
  if(shard.admin){
    let adminCount = 0
    let adminObj = {
      name: 'Payout Admin Roles',
      value: '```\n'
    }
    for(let i in shard.admin){
      adminCount++;
      adminObj.value += '@'+(shard.admin[i].name ? shard.admin[i].name:shard.admin[i].id)+'\n'
    }
    adminObj.value += '```'
    if(adminCount > 0) embedMsg.fields.push(adminObj)
  }
  let chObj = {
    name: 'Channels',
    value: ''
  }
  if(shard.payChannel) chObj.value += '`Payouts  :` <#'+shard.payChannel+'>\n'
  if(shard.rankChannel) chObj.value += '`Ranks    :` <#'+shard.rankChannel+'>\n'
  if(shard.logChannel) chObj.value += '`Main Log :` <#'+shard.logChannel+'>\n'
  if(shard.altChannel) chObj.value += '`Alt Log  :` <#'+shard.altChannel+'>\n'
  if(chObj.value != '') embedMsg.fields.push(chObj)
  return { content: null, embeds: [embedMsg] }
}
