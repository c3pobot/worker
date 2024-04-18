'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, fetchPlayer } = require('src/helpers')
const { getSquad } = require('src/helpers/squads')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discordId'}, squadData = {squads: [], info:{tdSpan: 0}}, pObj
  let squadName = getOptValue(opt, 'name')?.toString()?.trim()?.toLowerCase()
  if(!squadName) return { content: 'You did not provide a squad name', components: [] }
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send
  msg2send.content = 'Error finding squad **'+squadName+'**'
  let squad = await getSquad(obj, opt, squadName)
  if(squad){
    msg2send.content = 'error getting player data'
    pObj = await fetchPlayer({token: obj.token, allyCode: allyCode.toString()})
  }
  if(pObj?.rosterUnit) msg2send = await getImg(squad, pObj)
  return msg2send
}
