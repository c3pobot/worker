'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { dataList } = require('src/helpers/dataList')

const addAllyCode = require('./addAllyCode')
const verifyAccount = require('./verifyAccount')

module.exports = async(obj = {}, opt = {})=>{
  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'You did not provide an allyCode'}

  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id}))[0]
  if(dObj?.allyCodes?.filter(x=>x.allyCode === allyCode)?.length > 0) return { content: '**'+allyCode+'** is already linked to your account' }
  if(dObj?.allyCodes?.length >= 5) return { content: 'You can not link more than 5 allyCodes...' }

  let pObj = await swgohClient.post('queryPlayer', { allyCode: allyCode.toString() }, null)
  if(!pObj?.allyCode) return { content: `**${allyCode}** is not a valid allyCode` }

  let exists = (await mongo.find('discordId', { 'allyCodes.allyCode': +allyCode }))[0]
  if(exists?._id == obj.member.user.id) return { content: '**'+allyCode+'** for player **'+pObj.name+'** is already linked to your account' }
  if(!exists) return await addAllyCode(obj, opt, pObj)
  return await verifyAccount(obj, opt, pObj)
}
