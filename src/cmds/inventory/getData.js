'use strict'
const swgohClient = require('src/swgohClient')

const { getDiscordAC, replyTokenError } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return { msg2send: { content: 'You must have you android/ea_connect auth linked to your discordId' } }

  let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {});
  if(pObj?.error){
    await replyTokenError(obj, dObj?.allyCode, pObj.error)
    return 'TOKEN_ERROR'
  }
  return pObj
}
