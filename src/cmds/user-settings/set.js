'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')
const show = require('./show')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = (await mongo.find('discordId', {_id: obj.member?.user?.id}))[0]
  if(!dObj) return { content: 'you do not have discord Id linked to the bot' }

  let type = opt.type?.value || 'ga'
  let settings = dObj.settings || {}
  if(!settings[type]) settings[type] = {}
  for(let i in opt){
    if(i == 'type') continue
    settings[type][i] = opt[i].value
  }
  await mongo.set('discordId', { _id: obj.member?.user?.id }, {settings: settings })
  return await show(obj, opt)
}
