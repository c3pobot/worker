'use strict'
const { getOptValue } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let guild, pObj, msg2send = {content: 'invalid allyCode provided'}
  let allyCode = getOptValue(opt, 'allycode')
  if(allyCode){
    allyCode = allyCode.toString().replace(/-/g, '').trim()
    msg2send.content = 'Error finding player with allyCode **'+allyCode+'**'
    pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode}, null)
  }
  if(pObj?.guildId){
    msg2send.content = 'Error getting guild'
    guild = await swgohClient.post('queryArenaPlayers', {guildId: pObj.guildId})
  }
  if(guild?.length > 0){
    msg2send.content = pObj?.guildName+' Members ('+guild?.length+')\n```autohotkey\n'
    for(let i in guild) msg2send.content += guild[i].allyCode+' : '+guild[i].name+'\n'
    msg2send.content += '```'
  }
  return msg2send
}
