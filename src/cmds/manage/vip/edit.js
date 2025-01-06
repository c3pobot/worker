'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let dId = opt.user?.value || opt.discordid?.value?.trim(), crLimit = opt['cr-limit']?.value, vipLevel = opt.level?.value, status = opt.status?.value
  if(!dId) return { content: 'You must specify a @user' }

  let usr = opt.user?.data?.nick || opt.user?.data?.user?.username

  let pObj = (await mongo.find('vip', { _id: dId }, { _id: 0, TTL: 0 }))[0]
  if(!pObj) return { content: `${(usr ? usr:'that user')} is not a vip member` }

  if(crLimit >= 0) pObj.crLimit = crLimit
  if(vipLevel >= 0) pObj.level = +vipLevel
  if(status >=0) pObj.status = +status
  await mongo.set('vip', { _id: dId }, pObj)
  let embedMsg = {
    color: 15844367,
    title: (usr ? '**@'+usr+'**':'User')+' VIP Info',
    description: '```\n'
  }
  embedMsg.description += 'Discord ID : '+dId+'\n'
  embedMsg.description += 'Level      : '+pObj.level+'\n'
  embedMsg.description += 'Status     : '+(pObj.status ? 'enabled':'disabled')+'\n'
  embedMsg.description += 'CR Limit   : '+(pObj.crLimit ? pObj.crLimit:100)+'\n'
  embedMsg.description += '```'
  return { embeds: [embedMsg] }  
}
