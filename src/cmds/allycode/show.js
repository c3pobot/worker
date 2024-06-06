'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let user = opt.user?.data || obj.member
  if(!user.id) return { content: 'Error getting user...'}

  let dObj = (await mongo.find('discordId', { _id: user.id }))[0]
  if((!dObj?.allyCodes || dObj?.allyCodes?.length == 0) && user.id === obj.member?.user?.id) return { content: 'you do not have allyCode linked to your discordId.' }
  if(!dObj?.allyCodes || dObj?.allyCodes?.length == 0) return { content: 'That user does not have allyCode linked to discord id '}

  let msg2send = { content: `**@${ user?.display_name || user?.user?.username}** allyCode(s)\n` }
  msg2send.content += '```\n'
  for(let i in dObj.allyCodes) msg2send.content += `${dObj.allyCodes[i].allyCode} : ${dObj.allyCodes[i].opt || ''}\n`
  msg2send.content += '```'
  return msg2send
}
