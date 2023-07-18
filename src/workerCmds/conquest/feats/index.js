'use strict'
const { GetScreenShot, ReplyMsg } = require('helpers')
const CheckFeats = require('./checkFeats')
const CheckBattles = require('./checkBattles')
const GetRewards = require('./getRewards')
const getHTML = require('helpers/getHTML/conquest/feat')
const enumDiff = {
  8: 'I_DIFF',
  9: 'II_DIFF',
  10: 'III_DIFF'
}
module.exports = async(obj, opt = [], pObj ={})=>{
  try{
    let webHTML, webImg, msg2send = {content: 'Error getting feat info'}
    let eventDetails = pObj?.gameEvent?.find(x=>x.conquestId == pObj?.conquestStatus?.conquestDefinitionIdentifier)
    let eventInstanceId = pObj?.conquestStatus?.conquestEventIdentifier
    let webData = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated,
      totalKeys: 0,
      feats: [],
      stars: [],
      credits: 0,
      keys: 0,
      featType: 1
    }
    if(pObj.challengeProgress){
      let featChallenges = pObj.challengeProgress.filter(x=>x.eventInstanceId === eventInstanceId && x.campaignElementId.startsWith('CONQUEST:'+pObj.conquestStatus.conquestDefinitionIdentifier+':'+enumDiff[pObj.conquestStatus.difficultyType]))
      if(featChallenges.filter(x=>x.id?.includes('S0')).length > 0) webData.featType = 0
      let tempFeats = await CheckFeats(featChallenges, webData.featType);
      if(tempFeats?.complete >= 0){
        webData.totalKeys += tempFeats.complete + (tempFeats?.incomplete || 0)
        webData.keys += tempFeats.complete
        if(tempFeats.missing?.length > 0) webData.feats = tempFeats.missing
      }
    }
    if(pObj.conquestStatus?.nodeStatus){
      let tempStatus = await CheckBattles(pObj.conquestStatus.nodeStatus, pObj.conquestStatus.nodeSelection, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)
      if(tempStatus?.complete >= 0){
        webData.keys += tempStatus.complete
        webData.totalKeys += tempStatus.total
        if(tempStatus.battles?.length > 0) webData.stars = tempStatus.battles
      }
    }
    if(pObj.inventory) webData.credits = +(pObj.inventory.find(x=>x.currency == 39).quantity || 0)
    if(webData.keys > 0) webData.rewards = await GetRewards(+webData.keys, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)

    if(webData.totalKeys){
      msg2send.content = 'error getting feat HTML'
      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'error getting feat image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null,
      msg2send.file = webImg
      msg2send.fileName = 'conquest-feat.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
