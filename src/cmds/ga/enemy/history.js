'use strict'
const getImg = require('src/cmds/ga/history/getImg')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  return await getImg(obj, opt, gaInfo?.currentEnemy)
}
