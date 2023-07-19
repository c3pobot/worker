'use strict'
const swgohClient = require('swgohClient')
const { GetAllyCodeObj, ReplyButton, ReplyTokenError } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let pObj, msg2send = 'You must have google auth linked to your discordId'
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.uId && dObj?.type){
      if(obj?.confirm) await ReplyButton(obj, 'Getting player data ...')
      msg2send = 'Error Getting player data'
      pObj = await swgohClient('getInitialData', {}, dObj, obj)
      if(pObj?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return 'GETTING_CONFIRMATION';
      }
      if(pObj === 'GETTING_CONFIRMATION') return pObj;
      pObj = pObj?.data
    }
    return { msg2send: msg2send, data: pObj }
  }catch(e){
    throw(e);
  }
}
