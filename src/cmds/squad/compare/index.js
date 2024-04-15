'use strict'
const getImg = require('./getImg')
const { getOptValue, getDiscordAC, getPlayerAC, fetchPlayer } = require('src/helpers')
const { getSquad } = require('src/helpers/squads')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'you did not provide a squad name...'}, pObj, eObj
  let squadName = getOptValue(opt, 'name')?.toString()?.trim()
  if(!squadName) return msg2send
  let eAlly = await getPlayerAC(obj, opt)
  let pAlly = await getDiscordAC(obj.member.user.id, opt)
  if(!pAlly || !pAlly?.allyCode) return { content: 'You do not have allycode linked to discordId' }
  if(eAlly?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!eAlly?.allyCode) return { content: 'You must provide another player to compare with' }
  if(pAlly?.allyCode === eAlly?.allyCode) return { content: 'you can\'t compare to your self' }
  msg2send.content = 'Error finding squad **'+squadName+'**'
  let squad = await getSquad(obj, opt, squadName)

  if(squad){
    await replyButton(obj, 'Getting info for squad **'+squadName+'** ...')
    msg2send.content = 'Error pullling player info'
    pObj = await fetchPlayer({allyCode: pAlly?.allyCode?.toString()})
    eObj = await fetchPlayer({allyCode: eAlly?.allyCode?.toString()})
  }
  if(pObj?.allyCode && eObj?.allyCode) msg2send = await getImg(squad, pObj, eObj)
  return msg2send
}
