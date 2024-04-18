'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')
const show = require('./show')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Error running the command'}
  let dId = obj.member.user.id
  let type = getOptValue(opt, 'type', 'ga')
  let dObj = (await mongo.find('discordId', {_id: obj.member.user.id}))[0]
  if(!dObj) return { content: 'you do not have discord Id linked to the bot'}
  let settings = dObj.settings || {}
  if(!settings[type]) settings[type] = {}
  for(let i in opt){
    if(opt[i].name !== 'type') settings[type][opt[i].name] = opt[i].value
  }
  await mongo.set('discordId', {_id: dId}, {settings: settings})
  msg2send = await show(obj, opt)
  return msg2send
}
