'use strict'
const mongo = require('mongoclient')
const { getOptValue, confirmButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'Error clearing settings', components: null}
  let confirm = obj.confirm?.response
  let type = getOptValue(opt, 'type', 'ga')
  if(!confirm){
    await confirmButton(obj, 'Are you sure you want to clear you '+type+' user settings')
    return
  }
  if(confirm === 'no') msg2send.content = 'Command Canceled'
  if(confirm === 'yes'){
    if(obj.member?.user?.id) await mongo.set('discordId', {_id: obj.member.user.id}, {['settings.'+type]: null})
    msg2send.content = type+' user settings cleared'
  }
  return msg2send
}
