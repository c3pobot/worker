'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getHTML = require('webimg').faction
const { botSettings } = require('src/helpers/botSettings')
const { getPlayerAC } = require('src/helpers')
const { formatWebUnit } = require('src/format')
const { getFactionUnits, getImg, findFaction } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{

  let raidId = opt.raid?.value || botSettings?.defaultRaid
  if(!raidId) return { content: 'you must provide a raid' }

  let [ tempRaidFaction, tempRaidRequirement ] = await Promise.all([
    mongo.find('raidFactions', { raidId: raidId }),
    mongo.find('journeyGuide', { _id: raidId })
  ])
  if(!tempRaidFaction || !tempRaidRequirement) return { content: 'Error getting data from db' }

  let raidFaction = tempRaidFaction[0], raidReq = tempRaidRequirement[0]
  if(!raidFaction?.units || raidFaction?.units?.length === 0) return { content: 'there are no unit requirements for that raid in the db' }
  if(!raidReq?.baseId) return { content: 'there are no unit requirement template set up for that raid' }

  let fInfo
  if(opt.faction?.value){
    fInfo = await findFaction(obj, opt.faction.value, false)
    if(fInfo === 'GETTING_CONFIRMATION') return
    if(fInfo?.msg2send) return fInfo?.msg2send
    if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `Error finding faction **${faction}**` }
  }
  if(fInfo?.units?.length > 0) raidFaction.units = raidFaction.units.filter(x=>fInfo.units.includes(x))
  if(raidFaction?.units?.length === 0 && fInfo?.units) return { content: `there are not ${fInfo.nameKey} units allowed for this raid` }

  raidFaction.units = await mongo.find('units', { _id: { $in: raidFaction.units } })
  if(!raidFaction?.units || raidFaction?.units?.length === 0) return { content: 'error getting unit info from the data base' }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId'}
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let pObj = await swgohClient.post('fetchPlayer', {allyCode: allyCode.toString()})
  if(!pObj?.allyCode) return { content: '**'+allyCode+'** is an invalid allyCode' }

  let webUnits = await getFactionUnits(raidFaction, pObj.rosterUnit, formatWebUnit, 50)
  if(!webUnits || webUnits?.length == 0) return { content: 'Error calculating info' }

  let requirements = raidReq?.faction[raidFaction.baseId] || {}
  let rarity = requirements.rarity || 5, tier = requirements.tier || 1, relic = requirements.relic - 2 || 0
  if(relic < 0) relic = 0
  if(opt.relic_level?.value > relic){
    relic = opt.relic_level.value
    rarity = 7
  }else{
    if(opt.gear_level?.value > tier && opt.gear_level?.value < 14) tier = opt.gear_level.value
  }

  if(rarity) webUnits = webUnits.filter(x=>x.rarity >= rarity)
  if(relic) webUnits = webUnits.filter(x=>x.relic >= relic + 2)
  if(tier) webUnits = webUnits.filter(x=>x.gear >= tier)

  if(webUnits?.length === 0){
    let msg2send = `you have no units for ${raidFaction.nameKey} that are ${rarity}* G${tier} R${relic}`
    if(fInfo?.nameKey) msg2send += ` that are ${fInfo.nameKey}`
    return { content: msg2send }
  }
  let tempInfo = {
    player: pObj.name,
    nameKey: raidFaction.nameKey,
    footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
  }
  if(fInfo?.nameKey) tempInfo.nameKey += ' '+fInfo.nameKey
  let webData = await getHTML.basic(webUnits, tempInfo)
  if(!webData) return { content: 'error getting html...' }

  let webImg = await getImg(webData.html, null, 152, false)
  if(!webImg) return { content: 'error getting image...' }

  return { content: null, file: webImg, fileName: 'raid-'+raidFaction.speederbike+'.png' }
}
