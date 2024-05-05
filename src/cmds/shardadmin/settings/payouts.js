'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let poSort = opt.sort?.value, poGroupSort = opt['group-sort']?.value, poLimit = opt.limit?.value
  let msg2send = { content: ''}
  if(poSort){
    await mongo.set('payoutServers', {_id: shard._id}, {poSort: poSort})
    msg2send.content += 'Payout report sort has been set to '+poSort+'\n'
  }
  if(poGroupSort){
    await mongo.set('payoutServers', {_id: shard._id}, {sort: poGroupSort})
    msg2send.content += 'Payout groups have been set to sort by '+poGroupSort+'\n'
  }
  if(poLimit >= 0){
    await mongo.set('payoutServers', {_id: shard._id}, {poLimit: poLimit })
    msg2send.content += 'Payout report has been set to only show players with rank at or below **'+poLimit+'**\n'
  }
  if(msg2send.content == '') msg2send.content = 'There was an error with the provided information'
  return msg2send
}
