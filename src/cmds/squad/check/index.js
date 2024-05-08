'use strict'
const getImg = require('./getImg')
const { getPlayerAC, fetchPlayer } = require('src/helpers')
const { getSquad } = require('src/helpers/squads')
module.exports = async(obj = {}, opt = {})=>{
  let squadName = opt.name?.value || opt.squadId?.value
  if(!squadName) return { content: 'You did not provide a squad name', components: [] }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allyCode linked to discordId' }

  let squad = await getSquad(obj, opt)
  if(!squad) return { content: 'Error finding squad **'+squadName+'**' }

  let pObj = await fetchPlayer({ allyCode: allyCode.toString()})
  if(!pObj?.rosterUnit) return { content: 'error getting player data' }
  return await getImg(squad, pObj, 'yes')
}
