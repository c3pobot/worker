'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')
const getHtml = require('webimg').tb

const getUnitMap = require('./getUnitMap')
const getMissingUnitMap = require('./getMissingUnitMap')
const { fetchGuild, getDiscordAC, replyTokenError, getImg } = require('src/helpers')
const getTimeTillEnd = (timestamp)=>{
  let timeNow = Date.now()
  if(+timeNow < +timestamp){
    let delta = Math.abs(+timestamp - +timeNow) / 1000
    let hours = Math.floor(delta / 3600)
    delta -= hours * 3600
    let minutes = Math.floor(delta / 60)
    delta -= minutes * 60
    let seconds = Math.floor(delta)
    return({
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    })
  }else{
    return({
      h: '00',
      m: '00',
      s: '00'
    })
  }
}
module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have android or ea_connect auth linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
  if(!gObj?.data?.guild) return { content: 'Error getting guild data' }

  gObj = gObj.data.guild
  if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}

  let territoryBattleData = gObj.territoryBattleStatus[0]
  if(!territoryBattleData?.reconZoneStatus) return { content: 'Error getting recon zone status' }
  let tbDef = (await mongo.find('tbDefinition', { _id: territoryBattleData.definitionId }))[0]
  if(!tbDef.id) return { content: 'Error getting TB definition' }

  let commandState = obj.confirm?.commandState || 4, showPlayers = true
  let tempData = getUnitMap(territoryBattleData?.reconZoneStatus.filter(x=>x.zoneStatus.zoneState === 3 && x.zoneStatus.commandState < commandState), tbDef.reconZoneDefinition)
  if(!tempData.unitMap) return { content: 'Error getting unit map' }
  if(tempData.missingUnits == 0) return { content: 'all platoons are filled' }

  let unitMap = tempData.unitMap
  await mongo.set('tempCache', { _id: 'unitMap' }, unitMap)
  let rosterProject = {}
  for(let i in unitMap){
    if(unitMap[i].defId) rosterProject[unitMap[i].defId] = { baseId: 1, nameKey: 1, combatType: 1, icon: 1, gp: 1, rarity: 1, level: 1, relicTier: 1, gearTier: 1 }
  }
  let guild = await fetchGuild({ guildId: gObj.profile.id, projection: { playerId: 1, name: 1, roster: rosterProject } })
  if(!guild?.member) return { content: 'Error getting guild' }

  let missingUnitMap = getMissingUnitMap(unitMap, guild.member, tbDef, showPlayers)
  if(!missingUnitMap || missingUnitMap.length === 0) return { content: 'error getting missing unit map' }

  missingUnitMap = sorter([{column: 'sort', order: 'ascending'}], missingUnitMap)
  
  let webData = getHtml.missing({ name: gObj.profile.name, tbName: tbDef.nameKey, currentRound: territoryBattleData.currentRound, timeTillEnd: getTimeTillEnd(territoryBattleData.currentRoundEndTime), data: missingUnitMap, showPlayers: showPlayers })
  if(!webData) return { content: 'Error getting html' }

  let webImg = await getImg(webData, obj.id, 900, false)
  if(!webImg) return { content: 'Error getting image' }

  return { content: null, file: webImg, fileName: 'missing-platoons.png' }
}
