'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const gaReport = require('src/cmds/ga/report')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyButton, replyTokenError  } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, loginConfirm, pObj, gaLB gaInfo
  if(obj.confirm?.response) loginConfirm = obj.confirm.response
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj && dObj.allyCode){
    msg2send.content = 'You do not have google/fb linked to bot'
    gaInfo = await getGAInfo(dObj.allyCode)
  }
  if(dObj.uId && dObj.type){
    await replyButton(obj, 'Pulling player data ...')
    msg2send.content = 'Error getting player data'
    pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {}, loginConfirm)
    if(pObj?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj?.allyCode)
      return;
    }
    if(pObj === 'GETTING_CONFIRMATION') return
  }
  if(pObj?.data){
    msg2send.content = 'There is not a GAC in progress'
    if(pObj?.data?.territoryTournamentStatus && pObj.data.territoryTournamentStatus[0]){
      msg2send.content = 'Error getting GAC leaderboard info'
      let payload = {
        eventId: pObj.data.territoryTournamentStatus[0].tournamentEventId,
        groupId: pObj.data.territoryTournamentStatus[0].groupId,
        leaderboardType: 4,
        combatType: 1
      }
      gaLB = await swgohClient.oauth(obj, 'getLeaderboard', dObj, payload, loginConfirm)
      if(gaLB?.error == 'invalid_grant'){
        await replyTokenError(obj, dObj?.allyCode)
        return;
      }
      if(gaLB === 'GETTING_CONFIRMATION') return
    }
  }
  if(gaLB?.data?.player?.length > 0){
    await replyButton(obj, 'Pulling opponent data ...')
    gaInfo.enemies = []
    for(let i in gaLB.data.player){
      let pObj = await swgohClient.post('fetchGAPlayer', {id: gaLB.data.player[i].id, opponent: dObj.allyCode}, null)
      if(pObj?.playerId != dObj.playerId){
        gaInfo.enemies.push({
          playerId: pObj.playerId,
          allyCode: pObj.allyCode,
          name: pObj.name,
        })
      }
    }
    let currentMatch = pObj.data.territoryTournamentStatus[0].matchStatus.length > 0 ?  pObj.data.territoryTournamentStatus[0].matchStatus.length - 1 : 0;
    gaInfo.currentEnemy = pObj.data.territoryTournamentStatus[0].matchStatus[currentMatch].opponent.id;
    await mongo.set('ga', {_id: dObj.allyCode.toString()}, gaInfo);
    msg2send = await gaReport(obj, opt, dObj, gaInfo)
  }
  return msg2send
}
