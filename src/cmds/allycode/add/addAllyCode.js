'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  if(!pObj.allyCode) return { content: 'error getting player data' }
  await mongo.pull('discordId', { 'allyCodes.allyCode': +pObj.allyCode }, { allyCodes: { allyCode: +pObj.allyCode } })
  await mongo.del('allyCodeVerificationCache', { _id: pObj.playerId })
  await mongo.push('discordId', { _id: obj.member?.user?.id }, { allyCodes: { allyCode: +pObj.allyCode, playerId: pObj.playerId, name: pObj.name } })
  return { content: 'allyCode **'+pObj.allyCode+'** for player **'+pObj.name+'** has been linked to your discordId' }
}
