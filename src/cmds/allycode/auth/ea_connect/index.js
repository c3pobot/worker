'use strict'
const checkCode = require('./checkCode')
const requestEmail = require('./requestEmail')
const requestCode = require('./requestCode')

const { getDiscordAC, replyComponent, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{

  if(obj.confirm?.cancel) return { content: 'command canceled' }
  let allyCode = opt.allyCode, email = opt.email || obj.confirm?.email, code = opt.code || obj.confirm?.code
  if(!allyCode){
    let dObj = await getDiscordAC(obj.member.user.id, opt)
    allyCode = dObj?.allyCode
  }
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  obj.data.options.allyCode = allyCode
  if(email) obj.data.options.email = email
  if(!email){
    await replyMsg(obj, { content: 'sending hidden message', components: []})
    return await requestEmail(obj, opt)
  }
  if(!code) return await requestCode(obj, opt)
  return await checkCode(obj, opt, allyCode, email, code )
}
