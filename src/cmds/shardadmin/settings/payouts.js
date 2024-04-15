'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide and settings to change'}
  let poSort = getOptValue(opt, 'sort')
  let poGroupSort = getOptValue(opt, 'group-sort')
  let poLimit = getOptValue(opt, 'limit')
  if(opt.length > 0){
    msg2send.content = ''
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
  }
  return msg2send
}
