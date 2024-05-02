'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, replyTokenError } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  let cqData
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return { msg2send: { content: 'You must have you google or code auth linked to your discordId' } }

  if(opt.cache?.value === true){
    msg2send = 'There was no cached data in the db'
    cqData = (await mongo.find('conquestCache', {_id: dObj?.allyCode}))[0]
    if(!cqData) return { msg2send: { content: 'There was no cached data in the db' } }
    return { data: cqData }
  }

  let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {});
  if(pObj?.error){
    await replyTokenError(obj, dObj?.allyCode, pObj.error)
    return 'TOKEN_ERROR'
  }
  if(pObj?.msg2send) return { msg2send: pObj.msg2send }

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
    return { data: cqData }
  }
  return { msg2send: { content: 'error getting conquest data...'} }
}
