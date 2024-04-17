'use strict'
const mongo = require('mongoclient')
const { getOptValue, replyButton, getDiscordAC, replyTokenError } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let cqData, pObj, msg2send = 'You must have you google or guest auth linked to your discordId'
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return { msg2send: msg2send }
  let loginConfirm = obj?.confirm?.resposne
  let getCache = getOptValue(opt, 'cache')
  if(getCache === true){
    msg2send = 'There was no cached data in the db'
    cqData = (await mongo.find('conquestCache', {_id: dObj?.allyCode}))[0]
  }
  if(!getCache){
    await replyButton(obj, 'Getting info for conquest ...')
    msg2send = 'Error Getting player data'
    pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {}, loginConfirm);
    if(pObj === 'GETTING_CONFIRMATION') return pObj
    if(pObj?.error){
      await replyTokenError(obj, dObj?.allyCode, pObj.error)
      return 'GETTING_CONFIRMATION'
    }
  }
  if(pObj?.data?.conquestStatus && pObj?.data?.gameEvent && pObj?.data?.challengeProgress){
    cqData = {
      name: pObj.data.player?.name,
      allyCode: +(pObj.data.player?.allyCode || 0),
      guild: pObj.data.guild?.profile?.name,
      inventory: (pObj.data.inventory?.currencyItem?.filter(x=>x.currency == 39) || []),
      unit: (pObj.data.inventory?.unit || []),
      conquestStatus: pObj.data.conquestStatus,
      gameEvent: pObj.data.gameEvent,
      challengeProgress: pObj.data.challengeProgress,
      updated: Date.now()
    }
    await mongo.set('conquestCache', {_id: dObj.allyCode}, cqData)
  }
  return { msg2send: msg2send, data: cqData }
}
