'use strict'
const mongo = require('mongoclient')
const showStatus = require('./show')

const { getGuild } = require('src/helpers/discordmsg')
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value, patreon = opt.patreon?.value, patreonId = opt.patreonId?.value
  if(!id && !usr && !dId) return { content: 'you did not provide a shard id' }

  let query = { _id: id, patreonId: patreon || patreonId }
  if(query._id) delete query.patreonId
  let shard = (await mongo.find('payoutServers', query))[0]
  if(!shard) return { content: 'Error finding payout server **'+id+'**' }

  if(obj.confirm?.response == 'yes'){
    await mongo.set('payoutServers', { _id: shard._id }, { status: 1 })
    shard.status = 1
    return await showStatus(obj, opt, shard)
  }
  if(obj.confirm?.response && obj.confirm.response !== 'yes'){
    return await showStatus(obj, opt, shard)
  }

  let guild = await getGuild(shard.sId)
  let msg2send = { content: `are you sure you want to enable shard ${shard._id} on ${guild?.name}?`, components: [] }
  let actionRow = { type: 1, components: [] }
  actionRow.push({
    type: 2,
    label: 'Yes',
    style: 3,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'yes', subCmd: 'enable' })
  })
  actionRow.push({
    type: 2,
    label: 'no',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'no', subCmd: 'enable' })
  })
  msg2send.components.push(actionRow)
  await replyComponent(obj, msg2send)
}
