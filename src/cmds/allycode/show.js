'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'That user does not have allyCode linked to discord id'}, username
  let dId = getOptValue(opt, 'user')
  if(dId){
    if(obj?.data?.resolved?.members && obj?.data?.resolved?.users && obj.data.resolved.users[dId]){
      username = (obj.data.resolved.members[dId] && obj.data.resolved.members[dId].nick ? obj.data.resolved.members[dId].nick:obj.data.resolved.users[dId].username)
    }
  }
  if(!dId){
    dId = obj.member.user.id
    username = (obj.member.nick ? obj.member.nick:obj.member.user.username)
  }
  let dObj = (await mongo.find('discordId', {_id: dId}))[0]
  if(dObj?.allyCodes?.length > 0){
    msg2send.content = (username ? '@'+username:'Requested')+' allyCode(s)\n```\n'
    for(let i in dObj.allyCodes) msg2send.content += dObj.allyCodes[i].allyCode+(dObj.allyCodes[i].opt ? ' : '+dObj.allyCodes[i].opt:'')+'\n'
    msg2send.content += '```'
  }
  return msg2send
}
