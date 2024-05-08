'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = (await mongo.find('discordId', {_id: obj.member?.user?.id}))[0]
  if(!dObj || !dObj?.settings) return { content: 'you do not have discord Id linked to the bot' }

  if(!dObj.settings || Object.values(dObj.settings)?.length == 0) return { content: 'You do not have any settings saved' }
  let embedMsg = {
    title: (obj.member?.nick || obj.member?.user?.username)+' bot settings',
    fields: []
  }
  for(let i in dObj.settings){
    if(Object.values(dObj.settings[i])?.length == 0) continue
    let tempObj = {
      name: i,
      value: '```\n'
    }
    for(let s in dObj.settings[i]) tempObj.value += s+' : '+dObj.settings[i][s]+'\n'
    tempObj.value += '```'
    embedMsg.fields.push(tempObj)
  }
  if(embedMsg.fields?.length > 0) return { content: null, embeds: [embedMsg] }
  return  { content: 'You do not have any settings saved' }
}
