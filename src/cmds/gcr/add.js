'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let msg2send = {content: 'You did not provide the correct information'}
  let trigger = opt.trigger?.value?.toString()?.trim()?.toLowerCase(), response = opt.response?.value?.toString()?.trim(), crca = opt.anywhere?.value
  if(!trigger || !response) return { content: 'You did not provide the correct information' }

  let lcr = (await mongo.find('reactions', { _id: 'global' }))[0]
  if(lcr?.cr?.filter(x=>x?.trigger == trigger)?.length > 0) return { content: `a custom reaction for **${trigger}** already exists...`}

  let id = await mongo.next('reactions', { _id: 'global' }, 'crIndex')
  if(!id) return { content: 'error getting custom reaction new id' }
  await mongo.push('reactions', {_id: 'global' }, {cr: {
    id: id,
    anywhere: crca,
    trigger: trigger,
    response: response,
  }})
  let embedMsg = {
    color: 15844367,
    title: 'Global Custom Reaction',
    description: '**New Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
  }
  embedMsg.description += 'Trigger anywhere : \n'+(crca > 0 ? 'Yes':'No')
  return { content: null, embeds: [embedMsg] }
}
