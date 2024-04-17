'use strict'
const { getDiscordAC, replyTokenError, replyButton } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = 'You must have you google auth linked to your discordId'
  let loginConfirm = obj.confirm.response
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return { msg2send: msg2send }

  await replyButton(obj, 'Getting player data ...')
  msg2send = 'Error Getting player data'
  let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {}, loginConfirm);
  if(pObj === 'GETTING_CONFIRMATION') return pObj
  if(pObj?.error === 'invalid_grant'){
    await HP.ReplyTokenError(obj, dObj?.allyCode)
    return 'GETTING_CONFIRMATION';
  }
  return { msg2send: msg2send, data: pObj?.data }
}
