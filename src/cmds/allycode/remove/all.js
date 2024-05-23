'use strict'
const mongo = require('mongoclient')
const { confirmButton } = require('src/helpers')
const cleanAllyCode = async(obj = {})=>{
  if(!obj.uId) return
  await mongo.del('tokens', {_id: obj.uId })
  await mongo.del('facebook', {_id: obj.uId})
  await mongo.del('identity', {_id: obj.uId})
}
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...', components: [] }

  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }))[0]
  if(!dObj?.allyCodes || dObj?.allyCodes?.length == 0) return { content: 'There are no allyCode(s) regsiterd to your discordId' }

  if(!obj.confirm){
    await confirmButton(obj, `Are you sure you want to unlink all ${dObj.allyCodes?.length} allyCode(s) from your discordId`)
    return
  }
  if(obj.confirm?.response !== 'yes') return { content: 'command canceled...', components: [] }

  for(let i in dObj.allyCodes) await cleanAllyCode(dObj.allyCodes[i])
  await mongo.set('discordId', { _id: obj.member?.id }, { allyCodes: [] })
  return { content: 'Your discordId has been unlinked from all allyCodes' }
}
