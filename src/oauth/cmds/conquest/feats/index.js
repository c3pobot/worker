'use strict'
const getHTML = require('webimg').conquest
const checkFeats = require('./checkFeats')
const checkBattles = require('./checkBattles')
const getRewards = require('./getRewards')
const enumDiff = {
  8: 'I_DIFF',
  9: 'II_DIFF',
  10: 'III_DIFF'
}
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = [], pObj ={})=>{
  let featHtml, featImg, msg2send = {content: 'Error getting feat info'}
  let eventDetails = pObj?.gameEvent?.find(x=>x.conquestId == pObj?.conquestStatus?.conquestDefinitionIdentifier)
  let eventInstanceId = pObj?.conquestStatus?.conquestEventIdentifier
  let res = {
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
    if(featChallenges.filter(x=>x.id?.includes('S0')).length > 0) res.featType = 0
    let tempFeats = await checkFeats(featChallenges, res.featType);
    if(tempFeats?.complete >= 0){
      res.totalKeys += tempFeats.complete + (tempFeats?.incomplete || 0)
      res.keys += tempFeats.complete
      if(tempFeats.missing?.length > 0) res.feats = tempFeats.missing
    }
  }
  if(pObj.conquestStatus?.nodeStatus){
    let tempStatus = await checkBattles(pObj.conquestStatus.nodeStatus, pObj.conquestStatus.nodeSelection, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)
    if(tempStatus?.complete >= 0){
      res.keys += tempStatus.complete
      res.totalKeys += tempStatus.total
      if(tempStatus.battles?.length > 0) res.stars = tempStatus.battles
    }
  }
  if(pObj.inventory) res.credits = +(pObj.inventory.find(x=>x.currency == 39).quantity || 0)
  if(res.keys > 0) res.rewards = await getRewards(+res.keys, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)
  if(res.totalKeys){
    msg2send.content = 'error getting feat HTML'
    featHtml = await getHTML.feat(res)
  }
  if(featHtml){
    msg2send.content = 'error getting feat image'
    featImg = await getImg(featHtml, obj.id, 680, false)
  }
  if(featImg){
    msg2send.content = null,
    msg2send.file = featImg
    msg2send.fileName = 'conquest-feat.png'
  }
  return msg2send
}
