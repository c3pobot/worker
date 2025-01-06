'use strict'
const mongo = require('mongoclient')
const { confirmButton } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  let dId = opt.user?.value || opt.discordid?.value?.trim()
  if(!dId) return { content: 'you must specify a @user' }

  let usr = opt.user?.data?.nick || opt.user?.data?.user?.username

  if(!obj?.confirm){
    await confirmButton(obj, `Are you sure you waht to remove vip member ${(usr ? usr:`with discordId ${dId}`)}?`)
    return
  }

  if(obj?.confirm?.response !== 'yes') return { content: 'command canceled' }

  await mongo.del('vip', { _id: dId })
  return { content: `vip member ${(usr ? usr:`with discordId ${dId}`)} was removed.` }
}
