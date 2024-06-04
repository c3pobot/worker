'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let trigger = opt.trigger?.value?.toString()?.trim()?.toLowerCase()
  let response = opt.response?.value?.toString()?.trim()
  let crca = opt.anywhere?.value

  if(!trigger || !response) return { content: 'You did not provide the correct information' }

  let lcr = (await mongo.find('reactions', { _id: obj.guild_id }))[0]
  if(lcr?.cr?.filter(x=>x?.trigger == trigger)?.length > 0) return { content: `a custom reaction for **${trigger}** already exists...`}

  let id = await mongo.next('reactions', { _id: obj.guild_id}, 'crIndex')
  if(id >= 0){
    await mongo.push('reactions', {_id: obj.guild_id}, {cr: {
      id: id,
      anywhere: crca,
      trigger: trigger,
      response: response,
    }})
    let embedMsg = {
      color: 15844367,
      title: `${obj.guild?.name} Custom Reactions`,
      description: '**New Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
    }
    embedMsg.description += 'Trigger anywhere : \n'+(crca > 0 ? 'Yes':'No')
    return { content: null, embeds: [embedMsg] }
  }
  return { content: 'Error setting custom reaction' }
}
