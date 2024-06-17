'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').inventory
const getSquadHTML = require('webimg').squads
const { dataList } = require('src/helpers/dataList')
const { checkUnitMats, getImg, joinImages } = require('src/helpers')
const { getSquad, checkSquads } = require('src/helpers/squads')
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  if(!dataList?.gameData?.unitData) return { content: 'gameData list is empty.' }

  let relicRecipe = await mongo.find('recipe', {type: 'relic'})
  if(!relicRecipe || relicRecipe?.length === 0) return { content: 'Error getting relic info from db' }

  let squadName = opt.squad?.value || opt.squadId?.value
  if(squadName) opt.name = { value: squadName }

  let allyCode = pObj?.player?.allyCode, squad
  if(squadName){
    squad = await getSquad(obj, opt)
    if(!squad) return { content: 'Error finding squad **'+squadName+'**' }
  }else{
    squad = (await mongo.find('defaultUnits', { _id: allyCode?.toString() }))[0]
    if(!squad?.units || squad.units?.length === 0) return { content: 'you do not have any default units set. Use `/inventory add-unit` to set some' }
  }

  if(!squad) return { content: 'Error finding squad **'+squadName+'**' }

  let tempArray = squad.squads || []
  if(squad.units) tempArray.push(squad)
  if(!tempArray || tempArray?.length == 0) return { content: 'there are not squads to check against' }

  let squadData = await checkSquads(tempArray, pObj.inventory?.unit, true)
  if(!squadData?.squads || squadData?.squads?.length === 0) return { content: 'error checking squads' }

  let squadUnits = squadData?.squads[0]?.units
  if(!squadUnits || squadUnits?.length === 0) return { content: 'no units found in the squad check' }

  squadUnits = squadUnits?.filter(x=>x.combatType === 1)
  if(!squadUnits || squadUnits?.length === 0) return { content: 'all units in this squad are ships' }

  squadUnits = squadUnits?.filter(x=>x.notMet)
  if(!squadUnits || squadUnits?.length === 0) return { content: 'all units in this squad are at the required gear/relic level' }

  let mats = await checkUnitMats( squadUnits, relicRecipe, pObj?.inventory)
  if(!mats) return { content: 'Error Calcuting data'}

  let htmlArray = []
  squadData.info.playerName = pObj.player?.name
  squadData.info.squadName = squad.nameKey
  squadData.info.footer = 'Data Updated ' + (new Date()).toLocaleString('en-US', {timeZone: 'America/New_York'})
  if(squadData.info?.showStats){
    squadData.info.tdSpan = 10
    squadData.info.colLimit = 2
    if(squadData.info.unitCount < 2){
      squadData.info.tdSpan = 5
      squadData.info.colLimit = 1
    }
  }else{
    if(squadData.unitCount < 5){
      squadData.info.tdSpan = +squadData.info.unitCount
      squadData.info.colLimit = +squadData.info.unitCount
    }
  }
  squadData.squads[0].includeHeader = true
  let squadHtml = await getSquadHTML?.units(squadData.squads[0], squadData.info)
  if(!squadHtml) return { content: 'error getting squad html' }

  let webData = {
    material: mats,
    info: {
      player: pObj?.player?.name,
      nameKey: squad.nameKey,
      updated: Date.now(),
      includeInventory: true
    }
  }
  let inventoryHtml = await getHTML.journey(webData)
  if(!inventoryHtml) return { content: 'error getting inventory HTML' }

  let windowWidth = 728, imgArray = []
  if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)

  let squadImg = await getImg(squadHtml, null, windowWidth, false)
  if(!squadImg) return { content: 'error getting squad image' }

  imgArray.push(squadImg)

  let inventoryImg = await getImg(inventoryHtml, null, windowWidth, false)
  if(!inventoryImg) return { content: 'Error getting inventory image' }

  imgArray.push(inventoryImg)

  let webImg = await joinImages( imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
  if(!webImg) return { content: 'error joining images' }

  return { content: null, file: webImg, fileName: 'squad-gear.png' }

}
