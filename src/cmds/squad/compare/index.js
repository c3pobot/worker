'use strict'
const getImg = require('./getImg')
const { getDiscordAC, getPlayerAC, fetchPlayer } = require('src/helpers')
const { getSquad } = require('src/helpers/squads')

module.exports = async(obj = {}, opt = {})=>{
  let squadName = opt.name?.value || opt.squadId?.value
  if(!squadName) return { content: 'You did not provide a squad name', components: [] }

  let [ pAlly, eAlly ] = await Promise.allSettled([
    getDiscordAC(obj.member.user.id, opt),
    getPlayerAC({}, opt)
  ])
  if(!pAlly?.value?.allyCode) return { content: 'You do not have allycode linked to discordId' }
  if(eAlly?.value?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!eAlly?.value?.allyCode) return { content: 'You must provide another player to compare with' }
  if(+pAlly.value.allyCode === +eAlly.value.allyCode) return { content: 'you can\'t compare to your self' }

  let squad = await getSquad(obj, opt)
  if(!squad) return { content: `error finding squad ${squadName}` }

  let [ pObj, eObj ] = await Promise.allSettled([
    fetchPlayer({ allyCode: pAlly.value.allyCode.toString() }),
    fetchPlayer({ allyCode: eAlly.value.allyCode.toString() })
  ])
  if(!pObj?.value?.rosterUnit || !eObj?.value?.rosterUnit) return { content: 'Error getting player data'}

  return await getImg(squad, pObj.value, eObj.value)
}
