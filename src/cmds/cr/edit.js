'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value
  let trigger = opt.trigger?.value?.toString()?.trim()?.toLowerCase()
  let response = opt.response?.value?.toString()?.trim()
  let crca = opt.anywhere?.value
  if(!(id >= 0)) return { content: 'That is not a custom reaction for this server' }

  let lcr = (await mongo.find('reactions', { _id: obj.guild_id }))[0]
  if(!lcr || lcr?.cr?.length == 0) return { content: 'there are no custom reactions for this server' }

  let tempObj = lcr.cr.find(x=>x.id == id)
  if(!tempObj) return { content: 'That is not a custom reaction for this server' }
  if(trigger && lcr.cr.filter(x=>x.trigger == trigger && x.id !== id).length > 0) return { content: `**${trigger}** is already a custom reaction on this server...`}

  if(trigger) tempObj.trigger = trigger
  if(response) tempObj.response = response
  if(crca >= 0) tempObj.anywhere = crca
  await mongo.set('reactions', { _id: obj.guild_id, 'cr.id': id }, { 'cr.$': tempObj })
  let embedMsg = {
    color: 15844367,
    title: `${obj.guild?.name} Custom reactions`,
    description: '**Custom Reaction Updated**\n#'+id+'\n\n**Trigger** : \n'+tempObj.trigger+'\n\n**Response** : \n'+tempObj.response+'\n\n'
  }
  embedMsg.description += 'Trigger anywhere : \n'+(tempObj.anywhere > 0 ? 'Yes':'No')
  return { content: null, embeds: [embedMsg] }
}
