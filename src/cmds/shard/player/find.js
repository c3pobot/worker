'use strict'
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode' }

  let pObj = await swgohClient.post('queryPlayer', { allyCode: allyCode?.toString() })
  if(!pObj?.guildId) return { content: 'player with allyCode **'+allyCode+'** is not in a guild' }

  let members = await swgohClient.post('queryArenaPlayers', { guildId: pObj.guildId })
  if(!members || members?.length == 0) return { content: `error getting members for ${pObj.guildName}` }

  let msg2send = { content: pObj?.guildName+' Members ('+members?.length+')\n```autohotkey\n' }
  for(let i in memebers) msg2send.content += `${members[i].allyCode} : ${memebers[i].name}\n`
  msg2send.content += '```'
  return msg2send
}
