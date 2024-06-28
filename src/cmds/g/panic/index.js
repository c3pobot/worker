'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const getHTML = require('webimg').guild

const getGuideUnits = require('./getGuideUnits')
const checkMember = require('./checkMember')
const getFactionUnits = require('./getFactionUnits')


const { getPlayerAC, getGuildId, fetchGuild, getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let guideId = opt.journey?.value
  if(!guideId) return { content: 'You did not provide a squad name' }
  let guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
  delete guideTemplate?._id
  delete guideTemplate?.TTL
  if(!guideTemplate) return { content: 'The use of the `/panic` command has changed and you must use the auto complete options for `journey` input which will be the full unit name.\nIf you have done this and still getting this message than it could be that the requirements for the guide have not been set up in the bot yet' }

  let allyObj = await getPlayerAC(obj, obj?.data?.options)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allyCode linked to discordId' }

  let pObj = await getGuildId({}, { allyCode: allyCode })
  if(!pObj?.guildId) return { content: 'error finding guildId...' }

  let { requiredUnits, optionalUnits } = await getGuideUnits(guideTemplate)
  if(!requiredUnits || !optionalUnits) return { content: 'error getting guide' }
  if(requiredUnits?.length === 0 && optionalUnits.length === 0) return { content: 'error getting guide units' }

  if(optionalUnits?.length > 15) return { content: 'there is more than 15 units possible for this guide, i refuse to do this' }

  let rosterProject = {}
  for(let i in requiredUnits){
    if(!requiredUnits[i]) continue
    rosterProject[requiredUnits[i]] = { baseId: 1, nameKey: 1, combatType: 1, icon: 1, gp: 1, rarity: 1, level: 1, relicTier: 1, gearTier: 1 }
  }
  for(let i in optionalUnits){
    if(!optionalUnits[i]) continue
    rosterProject[optionalUnits[i]] = { baseId: 1, nameKey: 1, combatType: 1, icon: 1, gp: 1, rarity: 1, level: 1, relicTier: 1, gearTier: 1 }
  }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, roster: rosterProject } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: `error finding guild...` }

  let factionList = {}, unitList = { count: 0 }, data = []

  if(guideTemplate.factions?.length > 0){
    for(let i in guideTemplate.factions){
      guideTemplate.factions[i].units = getFactionUnits(guideTemplate.factions[i], new Set(requiredUnits))
    }
  }
  for(let i in gObj.member){
    let tempObj = await checkMember(gObj.member[i].roster, guideTemplate, factionList, unitList)
    if(!tempObj.requiredUnits) continue
    tempObj.name = gObj.member[i].name
    data.push(tempObj)
  }
  data = sorter([{ column: 'name', order: 'ascending'}], data)
  data = sorter([{ column: 'notMet', order: 'ascending'}], data)
  if(!data || data?.length === 0) return { content: 'error calcuating data' }
  await mongo.set('tempCache', { _id: 'g-panic' }, { guideTemplate: guideTemplate, unitList: unitList, profile: gObj.profile, member: data, updated: gObj.updated })
  let webHTML = getHTML.panic({ guideTemplate: guideTemplate, unitList: unitList, profile: gObj.profile, member: data, updated: gObj.updated })
  if(!webHTML) return { content: 'error getting html' }

  let webImg = await getImg(webHTML, obj.id, 50, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: `${gObj.profile?.name}-${guideTemplate.id}.png`}
}
