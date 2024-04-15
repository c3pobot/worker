'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, fetchPlayer } = require('src/helpers')
const { getSquad } = require('src/helpers/squads')
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide a squad name', components: []}
  let squadName = getOptValue(opt, 'name')
  if(!squadName) return msg2send
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discordId'}
  msg2send.content = 'Error finding squad **'+squadName+'**'
  let squad = await getSquad(obj, opt)
  if(!squad) return msg2send
  msg2send.content = 'Error getting player data'
  let pObj = await fetchPlayer({token: obj.token, allyCode: allyCode.toString()})
  if(pObj?.rosterUnit) msg2send = await getImg(squad, pObj, 'yes')
  return msg2send
}
