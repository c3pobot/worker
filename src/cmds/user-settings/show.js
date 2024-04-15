'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have any settings saved'}
  let dId = obj.member.user.id
  let dObj = (await mongo.find('discordId', {_id: obj.member?.user?.id}))[0]
  if(!dObj || !dObj?.settings) return msg2send
  if(Object.values(dObj.settings)?.length == 0) return msg2send
  let embedMsg = {
    title: (obj.member?.nick || obj.member?.user?.username)+' bot settings',
    fields: []
  }
  for(let i in dObj.settings){
    if(Object.values(dObj.settings[i])?.length > 0){
      const tempObj = {
        name: i,
        value: '```\n'
      }
      for(let s in dObj.settings[i]) tempObj.value += s+' : '+dObj.settings[i][s]+'\n'
      tempObj.value += '```'
      embedMsg.fields.push(tempObj)
    }
  }
  if(embedMsg.fields?.length > 0){
    msg2send.embeds = [embedMsg]
    msg2send.content = null
  }
  return msg2send
}
