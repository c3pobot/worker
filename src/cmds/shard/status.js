'use strict'
const mongo = require('mongoclient')
const { GetGuild, GetGuildMember } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let usr, patreonUsername
  let guild = await GetGuild(shard.sId)
  let players = await mongo.find('shardPlayers', {shardId: shard._id}, {allyCode: 1})
  if(shard.patreonId) usr = await GetGuildMember(shard.sId, shard.patreonId)
  if(usr?.nick){
    patreonUsername = usr.nick
  }else{
    if(usr?.user?.username) patreonUsername = usr.user.username
  }
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
  basicField.value += 'Players    : '+players.length+'\n'
  basicField.value += 'Shard Num  : '+shard.shard+'\n'
  if(shard.patreonId) basicField.value += 'Patreon    : @'+(patreonUsername ? patreonUsername:'UNKNOWN')+'\n'
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
