'use strict'
const mongo = require('mongoclient')
const { getOptValue, getGuildMemberName } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt =[])=>{
  let msg2send = {content: 'You did not provide and settings to change'}
  let chId = getOptValue(opt, 'channel', shard.adminChannel)
  let dId = getOptValue(opt, 'user', shard.adminUser)
  let option = getOptValue(opt, 'option')
  if(opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
  if(opt.find(x=>x.name == 'user')) dId = opt.find(x=>x.name == 'user').value
  if(opt.find(x=>x.name == 'option')) option = opt.find(x=>x.name == 'option').value
  if(option === 'channel'){
    if(chId){
      await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option, adminChannel: chId})
      msg2send.content = 'admin messages have been set up to post to <#'+chId+'>'
    }else{
      msg2send.content = 'You must provide a channel'
    }
  }
  if(option === 'dm'){
    if(dId){
      let usrname = await getGuildMemberName(obj.guild_id, dId)
      await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option, adminUser: dId})
      msg2send.content = 'admin messages have been set up to send to @'+usrname
    }else{
      msg2send.content = 'You must provide a user'
    }
  }
  if(option == 'off'){
    await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option})
    msg2send.content = 'admin messages have been turned off'
  }
  return msg2send
}
