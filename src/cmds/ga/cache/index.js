'use strict'
const mongo = require('mongoclient')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt= {})=>{
  if(opt.confirm?.value !== 1) return { content: 'nothing was done...' }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return { content: 'You do not have allyCode linked to discord Id' }

  await mongo.delMany('gaHistImg', {allyCode: +dObj.allyCode})
  return { content: 'Your GA Hist image cache was cleared\nNote: it will take longer to pull images now.' }
}
