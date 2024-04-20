'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'That user does not have allyCode linked to discord id'}
  let dId = getOptValue(opt, 'user', obj.member?.user?.id)
  let username = obj.member?.nick || obj.member?.user?.username

  if(dId !== obj.members?.user?.id && obj?.data?.resolved?.members && obj?.data?.resolved?.users){
    username = obj.obj.data.resolved.users[dId]?.nick || obj.data.resolved.members[dId]?.nick
    if(!username) username = obj.data.resolved.users[dId]?.username || obj.data.resolved.members[dId]?.username
  }
  let dObj = (await mongo.find('discordId', {_id: dId}))[0]
  if(!dObj?.allyCodes || dobj?.allyCodes?.length == 0 && dId === obj.member?.user?.id) return { content: 'you do not have allyCode linked to your discordId.' }
  if(!dObj?.allyCodes || dobj?.allyCodes?.length == 0) return msg2send
  msg2send.content = (username ? '@'+username:'Requested')+' allyCode(s)\n```\n'
  for(let i in dObj.allyCodes) msg2send.content += dObj.allyCodes[i].allyCode+(dObj.allyCodes[i].opt ? ' : '+dObj.allyCodes[i].opt:'')+'\n'
  msg2send.content += '```'
  return msg2send
}
