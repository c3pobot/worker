'use strict'
const getDiscordAC = require('./getDiscordAC')

module.exports = async(obj = {}, opt = {})=>{
  let res = { mentionError: 0, dId: opt.user?.value || obj.member?.user?.id, allyCode: opt.allycode?.value }
  if(!res.allyCode){
    let dObj = await getDiscordAC(res.dId, opt)
    if(!dObj?.allyCode && res.dId !== obj?.member?.user?.id) res.mentionError++
    if(dObj?.allyCode) res = {...res,...dObj}
  }
  if(res.allyCode) res.allyCode = +res.allyCode?.toString().trim().replace(/-/g, '')
  return res
}
