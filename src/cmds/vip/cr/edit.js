'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value, trigger = opt.trigger?.value?.trim()?.toLowerCase(), response = opt.response?.value?.trim(), crca = opt.anywhere?.value
  let lCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]
  if(!lCR?.cr || lCR?.cr?.length == 0) return { content: 'you do not have any personal custom reactions' }

  let cr = lCR.cr.find(x=>x.id == id)
  if(!cr?.trigger) return { content: `Could not find a personal custom reaction with ID **${id}**` }

  if(trigger && lCR.cr.filter(x=>x.trigger == trigger && x.id != id).length > 0) return { content: `There is already another reacton for **${trigger}` }

  let tempObj = Object.assign({}, cr)
  if(trigger) tempObj.trigger = trigger
  if(response) tempObj.response = response
  if(crca >= 0) tempObj.anywhere = crca
  await mongo.set('reactions', {_id: obj.member.user.id, 'cr.id': id}, {'cr.$': tempObj})
  let embedMsg = {
    color: 15844367,
    title: 'Personal Custom Reaction',
    description: '**Custom Reaction Updated**\n#'+id+'\n\n**Trigger** : \n'+tempObj.trigger+'\n\n**Response** : \n'+tempObj.response+'\n\n'
  }
  embedMsg.description += 'Trigger anywhere : \n'+(tempObj.anywhere > 0 ? 'Yes':'No')
  return { embeds: [embedMsg] }
}
