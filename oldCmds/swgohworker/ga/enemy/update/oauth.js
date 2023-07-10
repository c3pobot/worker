'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
const GAReport = require('src/cmds/ga/report')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, loginConfirm, pObj, gaLB, sendResponse = 1, gaInfo
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'You do not have google/fb linked to bot'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(dObj.uId && dObj.type){
      await HP.ReplyButton(obj, 'Pulling player data ...')
      msg2send.content = 'Error getting player data'
      pObj = await Client.oauth(obj, 'getInitialData', dObj, {}, loginConfirm)
      if(pObj?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj?.allyCode)
        return;
      }
    }
    if(pObj && pObj.data){
      msg2send.content = 'There is not a GAC in progress'
      if(pObj.data.territoryTournamentStatus && pObj.data.territoryTournamentStatus[0]){
        msg2send.content = 'Error getting GAC leaderboard info'
        const payload = {
          eventId: pObj.data.territoryTournamentStatus[0].tournamentEventId,
          groupId: pObj.data.territoryTournamentStatus[0].groupId,
          leaderboardType: 4,
          combatType: 1
        }
        gaLB = await Client.oauth(obj, 'getLeaderboard', dObj, payload, loginConfirm)
      }
    }
    if(gaLB && gaLB.data && gaLB.data.player && gaLB.data.player.length > 0){
      await HP.ReplyButton(obj, 'Pulling opponent data ...')
      gaInfo.enemies = []
      for(let i in gaLB.data.player){
        const pObj = await Client.post('fetchGAPlayer', {id: gaLB.data.player[i].id, opponent: dObj.allyCode}, null)
        if(pObj && pObj.playerId != dObj.playerId){
          gaInfo.enemies.push({
            playerId: pObj.playerId,
            allyCode: pObj.allyCode,
            name: pObj.name,
          })
        }
      }
      const currentMatch = pObj.data.territoryTournamentStatus[0].matchStatus.length > 0 ?  pObj.data.territoryTournamentStatus[0].matchStatus.length - 1 : 0;
      gaInfo.currentEnemy = pObj.data.territoryTournamentStatus[0].matchStatus[currentMatch].opponent.id;
      await mongo.set('ga', {_id: dObj.allyCode.toString()}, gaInfo);
      sendResponse = 0
      GAReport(obj, opt, dObj, gaInfo)
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
