'use strict'
const mongo = require('mongoclient')
const showStatus = require('./show')

const { getGuild } = require('src/helpers/discordmsg')
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value, patreon = opt.patreon?.value, patreonId = opt.patreonId?.value, channel = obj.confirm?.ch
  if(!id && !usr && !dId) return { content: 'you did not provide a shard id' }
  if(!channel) return { content: 'channel not provided.' }

  let query = { _id: id, patreonId: patreon || patreonId }
  if(query._id) delete query.patreonId
  let shard = (await mongo.find('payoutServers', query))[0]
  if(!shard) return { content: 'Error finding payout server **'+id+'**' }

  if(obj.confirm?.response == 'yes'){
    let tempObj = {}
    tempObj[channel] = null
    if(channel == 'payChannel') tempObj.payMsgs = []
    if(channel == 'rankMsgs') tempObj.payMsgs = []
    await mongo.set('payoutServers', { _id: shard._id }, tempObj)
    shard = { ...shard,...tempObj }
    return await showStatus(obj, opt, shard)
  }
  if(obj.confirm?.response && obj.confirm.response !== 'yes'){
    return await showStatus(obj, opt, shard)
  }

  let guild = await getGuild(shard.sId)
  let msg2send = { content: `are you sure you want to delete ${channel} on ${guild?.name}?`, components: [] }
  let actionRow = { type: 1, components: [] }
  actionRow.push({
    type: 2,
    label: 'Yes',
    style: 3,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'yes', subCmd: 'channel', ch: channel })
  })
  actionRow.push({
    type: 2,
    label: 'no',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'no', subCmd: 'channel', ch: channel })
  })
  msg2send.components.push(actionRow)
  await replyComponent(obj, msg2send)
}
