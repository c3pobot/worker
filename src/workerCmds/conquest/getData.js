'use strict'
const { mongo, GetAllyCodeObj, GetOptValue, ReplyButton, ReplyTokenError} = require('helpers')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let cqData, pObj, msg2send = 'You do not have google/code auth linked to your discordId'
    let getCache = GetOptValue(opt, 'cache', false)
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.allyCode && getCache){
      msg2send = 'There was no cached data in the db'
      cqData = (await mongo.find('conquestCache', {_id: dObj?.allyCode}))[0]
    }
    if(!getCache && dObj?.uId && dObj?.type){
      await ReplyButton(obj, 'Getting info for conquest ...')
      msg2send = 'Error Getting player data'
      pObj = await swgohClient('getInitialData', {}, dObj, obj)
      if(pObj?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return 'GETTING_CONFIRMATION';
      }
      if(pObj === 'GETTING_CONFIRMATION') return pObj;
      pObj = pObj?.data
    }
    if(pObj?.conquestStatus && pObj?.gameEvent && pObj?.challengeProgress){
      cqData = {
        name: pObj.player?.name,
        allyCode: +(pObj.player?.allyCode || 0),
        guild: pObj.guild?.profile?.name,
        inventory: (pObj.inventory?.currencyItem?.filter(x=>x.currency == 39) || []),
        unit: (pObj.inventory?.unit || []),
        conquestStatus: pObj.conquestStatus,
        gameEvent: pObj.gameEvent,
        challengeProgress: pObj.challengeProgress,
        updated: Date.now()
      }
      await mongo.set('conquestCache', {_id: dObj.allyCode}, cqData)
    }
    return { msg2send: msg2send, data: cqData }
  }catch(e){
    throw(e);
  }
}
