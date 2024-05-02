'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const gaReport = require('src/cmds/ga/report')

const { getDiscordAC, replyTokenError  } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.resposne == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google linked to bot' }

  let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {})
  if(pObj?.msg2send) return pObj.msg2send
  if(pObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj?.allyCode)
    return;
  }
  if(!pObj?.data) return { content: 'Error getting playerData' }

  pObj = pObj.data
  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo) gaInfo = { units: [], enemies: [] }
  if(!gaInfo.units) gaInfo.units = [];
  if(!gaInfo.enemies) gaInfo.enemies = [];
  if(!gaInfo.playerId && pObj.id) gaInfo.playerId = pObj.id
  if(!pObj?.territoryTournamentStatus || !pObj?.territoryTournamentStatus[0]?.groupId) return { content: 'There is not a GAC in progress' }

  let groupId = pObj.territoryTournamentStatus[0]?.groupId, eventId = pObj.territoryTournamentStatus[0].tournamentEventId
  if(!groupId || !eventId || groupId == '') return { content: 'There is not a GAC in progress' }

  let gaLB = await swgohClient.oauth(obj, 'getLeaderboard', dObj, { eventId: eventId, groupId: groupId, leaderboardType: 4, combatType: 1} )
  if(gaLB?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj?.allyCode)
    return;
  }
  if(gaLB?.msg2send) return { content: gaLB.msg2send }
  if(!gaLB?.data?.player || gaLB?.data?.player?.length == 0) return { content: 'Error getting GAC leaderboard info' }

  let enemies = await swgohClient.post('fetchGAPlayers', { players: gaLB.data.player.map(x=>x.id), opponent: dObj.allyCode })
  gaInfo.enemies = enemies?.map(x=>{
    return Object.assign({}, {
      playerId: x.playerId,
      allyCode: x.allyCode,
      name: x.name
    })
  })
  if(!gaInfo?.enemies || gaInfo?.enemies?.length !== gaLB?.data?.player?.length) return { content: 'Error getting ga opponents'}

  let currentMatchIndex = pObj.territoryTournamentStatus[0].matchStatus.length > 0 ?  pObj.territoryTournamentStatus[0].matchStatus.length - 1 : 0;
  gaInfo.currentEnemy = pObj.territoryTournamentStatus[0].matchStatus[currentMatchIndex].opponent.id;
  gaInfo.enemies = gaInfo.enemies.filter(x=>x.playerId !== pObj.id);
  await mongo.set('ga', {_id: dObj.allyCode.toString()}, gaInfo);

  return await gaReport(obj, opt, dObj, gaInfo)
}
