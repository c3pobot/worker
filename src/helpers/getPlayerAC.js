'use strict'
const getDiscordAC = require('./getDiscordAC')
const getOptValue = require('./getOptValue')

module.exports = async(obj = {}, opt = [])=>{
  let res = { mentionError: 0 }
  res.dId = getOptValue(opt, 'user', obj.member?.user?.id)
  res.allyCode = getOptValue(opt, 'allycode')
  if(!res.allyCode){
    let dObj = await getDiscordAC(res.dId, opt)
    if(!dObj?.allyCode && res.dId !== obj.member.user.id) res.mentionError++
    if(dObj?.allyCode) res = {...res,...dObj}
  }
  if(res.allyCode) res.allyCode = +res.allyCode?.toString().trim().replace(/-/g, '')
  return res
}
