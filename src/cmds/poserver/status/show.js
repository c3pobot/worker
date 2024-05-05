'use strict'
const mongo = require('mongoclient')
const botInfo = require('src/helpers/botRequest/botInfo')

const { getGuild, getUser, getRoles } = require('src/helpers/discordmsg')
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, shard)=>{
  let id = opt.id?.value, patreon = opt.patreon?.value, patreonId = opt.patreonId?.value
  if(!id && !usr && !dId && !shard) return { content: 'you did not provide a shard id' }

  if(!shard){
    let query = { _id: id, patreonId: patreon || patreonId }
    if(query._id) delete query.patreonId
    shard = (await mongo.find('payoutServers', query))[0]
  }
  if(!shard) return { content: 'Error finding payout server **'+id+'**' }

  let usr
  let playerCount = await mongo.count('shardPlayers', {shardId: shard._id}, {allyCode: 1})
  if(shard.patreonId) usr = await getUser(shard.patreonId)
  let guild = await getGuild(shard.sId)
  let embedMsg = {
    title: (guild && guild.name ? guild.name+' ':'')+'Payout Server info',
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
  basicField.value += 'Shard Num  : '+botInfo.getId(shard.sId)+'\n'
  if(shard.patreonId) basicField.value += 'Patreon    : @'+(usr ? usr.username:'UNKNOWN')+'\n'
  basicField.value += 'PO Sort    : '+shard.poSort+'\n'
  basicField.value += 'Group Sort : '+shard.sort+'\n'
  basicField.value += 'Rank Sort  : '+(shard.rankSort ? shard.rankSort:'ascending')+'\n'
  basicField.value += 'Type       : '+(shard.type == 'char' ? 'Squad':'Fleet')+'\n'
  basicField.value += 'Status     : '+(shard.status == 1 ? 'Enable':'Disabled')+'\n'
  basicField.value += '```'
  embedMsg.fields.push(basicField)
  if(shard.admin && shard.admin.length > 0){
    let roles = await getRoles(shard.sId)
    let adminObj = {
      name: 'Payout Admin Roles',
      value: '```\n'
    }
    for(let i in shard.admin){
      if(roles && roles.find(x=>x.id == shard.admin[i].id)) adminObj.value += roles.find(x=>x.id == shard.admin[i].id).name+'\n'
    }
    adminObj.value += '```'
    embedMsg.fields.push(adminObj)
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
  let components = [], actionRow = { type: 1, components: [] }
  if(shard.status) actionRow.components.push({
    type: 2,
    label: 'Disable Shard',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'disable' })
  })
  if(!shard.status) actionRow.components.push({
    type: 2,
    label: 'Enable Shard',
    style: 3,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'enable' })
  })
  actionRow.components.push({
    type: 2,
    label: 'Cancel',
    style: 3,
    custom_id: JSON.stringify({ dId: "1" })
  })
  components.push(actionRow)
  let chRow = { type: 1, components: [] }
  if(shard.payChannel) chRow.components.push({
    type: 2,
    label: 'Delete payChannel',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'channel', ch: 'payChannel' })
  })
  if(shard.rankChannel) chRow.components.push({
    type: 2,
    label: 'Delete rankChannel',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'channel', ch: 'rankChannel' })
  })
  if(shard.logChannel) chRow.components.push({
    type: 2,
    label: 'Delete logChannel',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'channel', ch: 'logChannel' })
  })
  if(shard.altChannel) chRow.components.push({
    type: 2,
    label: 'Delete altChannel',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, subCmd: 'channel', ch: 'altChannel' })
  })
  components.push(chRow)
  await replyComponent(obj, { content: null, embeds: [embedMsg], components: components || [] })
}
