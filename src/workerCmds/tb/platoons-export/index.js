'use strict'
const fs = require('fs')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const { mongo, GetAllyCodeObj, GetGuildId, GetOptValue, Json2xls, ReplyMsg} = require('helpers')

const MapPlatoons = async(data = {}, platoons = {}, maxRelic = 9)=>{
  try{
    if(data?.squads?.length > 0){
      for(let i in data.squads){
        if(data.squads[i].units?.filter(x=>maxRelic >= x.unitRelicTier).length > 0){
          if(!platoons[data.id]) platoons[data.id] = {units:{}, phase: data.phase, type: data.type}
          await MapUnits(data.squads[i].units, platoons, data.id, data.phase, data.type)
        }
      }
    }
  }catch(e){
    console.error(e);
  }
}
const MapUnits = async(units = [], platoons = {}, pId, phase, type)=>{
  try{
    for(let i in units){
      if(!platoons[pId]?.units[units[i].baseId]) platoons[pId].units[units[i].baseId] = {phase: phase, type: type, combatType: (units[i].combatType == 1 ? 'CHAR':'SHIP'), baseId: units[i].baseId, rarity: units[i].rarity, relic: (units[i].unitRelicTier - 2), unit: units[i].nameKey, count: 0,}
      if(!platoons[pId]?.relicTier) platoons[pId].relicTier = units[i].unitRelicTier
      if(platoons[pId]?.units[units[i].baseId]?.count >= 0) platoons[pId].units[units[i].baseId].count++
    }
  }catch(e){
    console.error(e);
  }
}
const playerProjection = { name: 1, playerId: 1, allyCode: 1, guildName: 1, guildId: 1, rosterUnit:1, summary: 1 }
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting data'}, platoonDef, platoons, excelData, excelFile, platObj = [], guildId, clearContent = true, gObj, rosterUnits = []
    let tbId = GetOptValue(opt, 'tb-name', 't05D')
    let maxRelic = GetOptValue(opt, 'relic', 9)
    if(+maxRelic > 9) maxRelic = 9
    maxRelic = +maxRelic + 2
    let includeRoster = GetOptValue(opt, 'roster', true)

    if(includeRoster){
      clearContent = false
      msg2send.content = 'your discord Id is not linked to allyCode'
      let dObj = await GetAllyCodeObj(obj, opt)
      if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
      let pObj = await GetGuildId({}, {allyCode: dObj?.allyCode}, [])
      if(pObj?.guildId){
        clearContent = true
        guildId = pObj.guildId
      }
    }
    if(guildId){
      clearContent = false
      msg2send.content = 'error getting guild data'
      gObj = await swgohClient('fetchGuild', { id: guildId,  playerProject: playerProjection})
    }
    if(gObj?.member?.length > 0){
      clearContent = true
      for(let i in gObj?.member){
        let units = gObj.member[i].rosterUnit?.map(x=>{
          return Object.assign({
            player: gObj.member[i].name,
            baseId: x.definitionId?.split(':')[0],
            rarity: +(x.currentRarity || 0),
            relic: +(x.relic?.currentTier > 1 ? +x.relic.currentTier - 2:0),
            gp: +(x.gp || 0)
          })
        })
        if(units?.length > 0) rosterUnits = rosterUnits.concat(units)
      }
    }
    if(tbId){
      msg2send.content = 'Error finding platoons for '+tbId
      platoonDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
    }
    if(platoonDef?.platoons?.length > 0){
      msg2send.content = 'Error mapping platoons'
      platoons = {}
      for(let i in platoonDef.platoons) await MapPlatoons(platoonDef.platoons[i], platoons, maxRelic)
      platoons = Object.values(platoons)
      if(platoons?.length > 0){
        for(let i in platoons){
          platObj = platObj.concat(Object.values(platoons[i].units))
        }
      }
    }
    if(platObj?.length > 0){
      msg2send.content = 'Error mapping excel data'
      platObj = sorter([{column: 'phase', order: 'descending'}], platObj)
      if(!excelData) excelData = {}
      excelData.platoons = platObj
    }
    if(rosterUnits?.length > 0 && excelData){
      excelData.units = rosterUnits
    }
    if(excelData?.platoons){
      msg2send.content = 'Error mapping excel data'
      excelFile = Json2xls(excelData)
      console.log(excelFile)
    }
    if(excelFile){
      if(clearContent) msg2send.content = null
      if(clearContent && includeRoster && !excelData.units) msg2send.content = 'Error getting guild roster'
      msg2send.file = excelFile
      msg2send.fileName = tbId+'-platoons.xlsx'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
