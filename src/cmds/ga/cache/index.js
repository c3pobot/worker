'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt= [])=>{
  let msg2send = {content: 'Nothing was done'}, dObj
  let confirm = getOptValue(opt, 'confirm')
  if(confirm){
    msg2send.content = 'You do not have allyCode linked to discord Id'
    dObj = await getDiscordAC(obj.member.user.id, opt)
  }
  if(dObj?.allyCode){
    msg2send.content = 'Your GA Hist image cache was cleared\nNote: it will take longer to pull images now.'
    mongo.delMany('gaHistImg', {allyCode: +dObj.allyCode})
  }
  return msg2send
}
