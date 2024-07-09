'use strict'
const mongo = require('mongoclient')
const { forceMessage } = require('./helper')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let msg2send = {content: 'Rotation schedule not found'}
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}
  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(!rots || !rots[schedule]) return msg2send
  if(rots[schedule].poOffSet == null) return { content: 'po offSet is not set for **'+schedule+'**' }
  msg2send.content = 'Sent message to <#'+rots[schedule].chId+'>'
  forceMessage(rots[schedule])
  return msg2send
}
