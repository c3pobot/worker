'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = {})=>{
  let dId = opt.user?.value, crLimit = +(opt['cr-limit']?.value || 100), vipLevel = +(opt.level?.value || 1)
  if(!dId) return { content: 'You must specify a @user' }

  let usr = opt.user?.data?.nick || opt.user?.data?.user?.username
  let exists = (await mongo.find('vip', {_id: dId}))[0]
  if(exists) return { content: `${(usr ? usr:'that user')} is already a vip member` }

  await mongo.set('vip', { _id: dId }, { crLimit: crLimit, status: 1, level: vipLevel })
  return { content: `${(usr ? usr:'that user')} was added as level **${vipLevel}** vip with cr limit of **${crLimit}**` }
}
