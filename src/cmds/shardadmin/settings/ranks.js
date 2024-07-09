'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let rankSort = opt.sort?.value, rankLimit = opt.limit?.value, rankLeader = opt.leader?.value, rankTruncate = opt.truncate?.value
  let msg2send = { content: ''}
  if(rankSort){
    mongo.set('payoutServers', {_id: shard._id}, {rankSort: rankSort})
    msg2send.content += 'Rank report sort has been set to '+rankSort+'\n'
  }
  if(rankLimit >= 0){
    await mongo.set('payoutServers', {_id: shard._id}, {rankLimit: rankLimit })
    msg2send.content += 'Rank report has been set to only show players with rank at or below **'+rankLimit+'**\n'
  }
  if(rankLeader){
    await mongo.set('payoutServers', {_id: shard._id}, {rankLeader: rankLeader})
    msg2send.content += 'Rank report has been set to '+(rankLeader ? 'show':'not show')+' squad leader\n'
  }
  if(rankTruncate){
    await mongo.set('payoutServers', {_id: shard._id}, {truncateRankLeader: rankTruncate})
    msg2send.content += 'Rank report has been set to '+(rankTruncate ? 'shorten':'not shorten')+' squad leader name\n'
  }
  if(msg2send.content == '') msg2send.content = 'There was an error with the provided information'
  return msg2send
}
