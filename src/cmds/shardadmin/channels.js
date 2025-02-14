'use strict'
const mongo = require('mongoclient')

const { checkBotPerms, createIntialMessage } = require('src/helpers')

const enumChannels = {
  payouts: 'payChannel',
  ranks: 'rankChannel',
  logs: 'logChannel',
  'alt-log': 'altChannel'
}

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let hasPerms = {}, msg2send = { content: '' }
  let payChannel = opt.payout?.data, ranksChannel = opt.ranks?.data, logChannel = opt.logs?.data, altChannel = opt.logs?.data
  for(let i in opt){
    if(!opt[i].data || !enumChannels[i]) continue;
    if(opt[i].data?.parent_id !== shard.catId){
      msg2send.content += '<#'+opt[i].value+'> is not in the same category as the shard\n'
      continue
    }
    let perms = opt[i]?.data?.botPerms?.filter(x=>x === 'SendMessages').length
    if(!perms) msg2send.content += `i do not have Send Message permission for <#${opt[i].value}>\n`
    if(perms && (i == 'payouts' || i == 'ranks')){
      perms = opt[i]?.data?.botPerms?.filter(x=>x === 'ManageMessages').length
      if(!perms) msg2send.content += `i do not have Manage Message permission for <#${opt[i].value}>\n`
    }
    if(perms) hasPerms[enumChannels[i]] = opt[i].data
  }
  if(Object.values(hasPerms)?.length == 0) return { content: 'Error checking channel permsissions'}

  let payload = {}

  for(let i in hasPerms){
    if(i === 'payChannel' || i == 'rankChannel'){
      let status = await createIntialMessage({ chId: hasPerms[i].id, sId: shard.sId })
      if(!status?.id) continue
      if(i === 'payChannel') payload.payMsgs = [status.id]
      if(i === 'rankChannel') payload.rankMsgs = [status.id]
    }
    payload[i] = hasPerms[i].id
    msg2send.content += `<#${hasPerms[i].id}> was set as ${i}\n`
  }
  if(Object.values(payload)?.length == 0) return { content: 'Error setting channels'}

  await mongo.set('payoutServers', {_id: shard._id}, payload)
  return msg2send
}
