'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = {})=>{
  let dObj = (await mongo.find('discordId', { _id: obj.member.user.id }))[0]
  if(!dObj?.allyCodes || dObj?.allyCodes?.length == 0) return { content: 'You do not have an allyCode linked. use `/allycode add` to link' }

  let allyCodes = []
  for(let i in dObj.allyCodes){
    if(allyCodes.filter(x=>+x.allyCode == +dObj.allyCodes[i].allyCode).length == 0) allyCodes.push(dObj.allyCodes[i])
  }
  for(let i in allyCodes) allyCodes[i].allyCode = +allyCodes[i].allyCode
  if(allyCodes.length > 0) await mongo.set('discordId', { _id: dObj._id }, { allyCodes: allyCodes })
  return { content: 'Duplicate allyCodes have been removed' }
}
