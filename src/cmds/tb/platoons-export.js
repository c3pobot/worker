'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const json2xls = require('json2xls');

const { getPlayerAC, getGuildId } = require('src/helpers')

const mapPlatoons = (data = {}, platoons = {}, maxRelic = 11)=>{
  if(!data?.squads || data?.squads?.length === 0) return
  for(let i in data.squads){
    if(data.squads[i].units?.filter(x=>maxRelic >= x.unitRelicTier).length > 0){
      if(!platoons[data.id]) platoons[data.id] = {units:{}, phase: data.phase, type: data.type}
      mapUnits(data.squads[i].units, platoons, data.id, data.phase, data.type)
    }
  }
}
const mapUnits = (units = [], platoons = {}, pId, phase, type)=>{
  for(let i in units){
    if(!platoons[pId]?.units[units[i].baseId]) platoons[pId].units[units[i].baseId] = {phase: phase, type: type, combatType: (units[i].combatType == 1 ? 'CHAR':'SHIP'), baseId: units[i].baseId, rarity: units[i].rarity, relic: (units[i].unitRelicTier - 2), unit: units[i].nameKey, count: 0,}
    if(!platoons[pId]?.relicTier) platoons[pId].relicTier = units[i].unitRelicTier
    if(platoons[pId]?.units[units[i].baseId]?.count >= 0) platoons[pId].units[units[i].baseId].count++
  }
}

module.exports = async(obj = {}, opt = {})=>{
  let excelPlats, excelUnits

  let tbId = opt['tb-name']?.value || 't05D'
  let platoonDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
  if(!platoonDef?.platoons || platoonDef?.platoons?.length === 0) return { content: 'Error finding platoons for '+tbId }

  let maxRelic = +(opt.relic?.value || 9), platoons = {}, platObj = []
  if(maxRelic > 9) maxRelic = 9
  maxRelic = +maxRelic + 2
  for(let i in platoonDef.platoons) mapPlatoons(platoonDef.platoons[i], platoons, maxRelic)
  platoons = Object.values(platoons)
  if(!platoons || platoons?.length == 0) return { content: 'error mapping platoons' }

  for(let i in platoons){
    platObj = platObj.concat(Object.values(platoons[i].units))
  }
  if(!platObj || platObj?.length == 0) return { content: 'Error converting platoon map' }

  platObj = sorter([{column: 'phase', order: 'descending'}], platObj)
  let tempExcelPlats = await json2xls(platObj, {fields: {
    phase: 'string',
    type: 'string',
    combatType: 'string',
    relic: 'number',
    baseId: 'baseId',
    unit: 'string',
    count: 'number'
  }})
  if(tempExcelPlats) excelPlats = Buffer.from(tempExcelPlats, 'binary')
  if(!excelPlats) return { content: 'Error mapping excel platoon data'}

  let includeRoster = opt.roster?.value
  if(includeRoster !== true && includeRoster !== false) includeRoster = true
  if(includeRoster){
    let pObj = await getGuildId({dId: obj.member?.user?.id}, {}, [])
    if(!pObj?.guildId) return { content: 'your discord Id is not linked to allyCode' }

    let gObj = await swgohClient.post('fetchGuild', {token: obj.token, id: guildId, projection: { playerId: 1, name: 1, rosterUnit: { definitionId: 1, currentRarity: 1, relic: 1, gp: 1} }}, null)
    if(!gObj?.member || gObj?.member?.length === 0) return { content: 'error getting guild data' }

    let rosterUnits = []
    for(let i in gObj?.member){
      let units = gObj.member[i].rosterUnit?.map(x=>{
        return Object.assign({
          player: gObj.member[i].name,
          baseId: x.definitionId?.split(':')[0],
          rarity: +(x.currentRarity || 0),
          relic: +(x.relic?.currentTier ? +x.relic.currentTier - 2:0),
          gp: +(x.gp || 0)
        })
      })
      if(units?.length > 0) rosterUnits = rosterUnits.concat(units)
    }
    if(!rosterUnits || rosterUnits?.length === 0) return { content: 'Error mapping players'}
    let tempObj = await json2xls(rosterUnits, {fields: {
      player: 'string',
      baseId: 'string',
      rarity: 'number',
      relic: 'number',
      gp: 'number'
    }})
    if(tempObj) excelUnits = Buffer.from(tempObj, 'binary')
    if(!excelUnits) return { content: 'Error mapping excel player data'}
  }
  let msg2send = { content: null, files: [] }
  msg2send.files.push({file: excelPlats, fileName: tbId+'-platoons.xlsx'})
  if(excelUnits) msg2send.files.push({file: excelUnits, fileName: 'rosterUnits.xlsx'})
  return msg2send
}
