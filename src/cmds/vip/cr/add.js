'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let msg2send = {content: 'You did not provide the correct information'}, limit = 100000, cr = []
  let trigger = opt.trigger?.value?.trim()?.toLowerCase()
  let response = opt.response?.value?.trim()
  let crca = +(opt.anywhere?.value || 0)
  if(!trigger || !response) return { content: 'You did not provide the correct information' }

  let vip = (await mongo.find('vip', {_id: obj.member.user.id}))[0]

  if(vip?.crLimit) limit = vip.crLimit
  let localCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]

  if(localCR?.cr) cr = localCR.cr
  if(+cr.length >= limit) return { content: `You are limited to **${limit}** and you have **${cr.length}** custom reactions` }
  if(cr.filter(x=>x.trigger == trigger).length > 0) return { content: `a custom reaction for **${trigger}** already exists` }

  let id = await mongo.next('reactions', {_id: obj.member.user.id}, 'crIndex')
  if(id >= 0){
    await mongo.push('reactions', {_id: obj.member.user.id}, {cr: {
      id: id,
      anywhere: crca,
      trigger: trigger,
      response: response
    }})
  }
  let embedMsg = {
    color: 15844367,
    title: 'Personal Custom Reaction',
    description: '**New Custom Reaction**\n#'+id+'\n\n**Trigger** : \n'+trigger+'\n\n**Response** : \n'+response+'\n\n'
  }
  embedMsg.description += 'Trigger anywhere : \n'+(crca > 0 ? 'Yes':'No')
  return { embeds: [embedMsg] }
}
