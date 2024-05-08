'use strict'
const mongo = require('mongoclient')
const { confirmButton } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response !== 'yes') return { content: 'Command Canceled' }

  let type = opt.type?.value || 'ga'
  if(!obj.confirm?.response){
    await confirmButton(obj, 'Are you sure you want to clear your '+type+' user settings')
    return
  }

  if(obj.confirm?.response === 'yes'){
    await mongo.set('discordId', {_id: obj.member.user.id}, {['settings.'+type]: null})
    return { content: type+' user settings cleared' }
  }

  return { content: 'Command Canceled' }
}
