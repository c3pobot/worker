'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const { getDiscordAC } = require('src/helpers')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, pObj, gaInfo
  const dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = 'You do not have a GA opponent configured'
    gaInfo = await getGAInfo(dObj.allyCode)
    if(!gaInfo) gaInfo = {enemies:[], units: []}
  }
  if(gaInfo.enemies.length > 0){
    msg2send.content = 'Error getting player info'
    pObj = await swgohClient.post('fetchPlayer', {allyCode: +dObj.allyCode}, null)
  }
  if(pObj?.allyCode){
    msg2send.embeds = []
    msg2send.content = null
    const enemyMsg = {
      color: 15844367,
      title: pObj.name+' GA opponents',
      description: ''
    }
    if(gaInfo.TTL) enemyMsg.timestamp = gaInfo.TTL
    const enemies = sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
    const currentEnemy = enemies.find(x=>x.playerId == gaInfo.currentEnemy)
    if(currentEnemy) enemyMsg.description += '[`'+currentEnemy.allyCode+'` : '+currentEnemy.name+' (Current)](https://swgoh.gg/p/'+currentEnemy.allyCode+'/gac-history/)\n'
    for(let i in enemies){
      if(enemies[i].playerId != gaInfo.currentEnemy) enemyMsg.description += '[`'+enemies[i].allyCode+'` : '+enemies[i].name+'](https://swgoh.gg/p/'+enemies[i].allyCode+'/gac-history/)\n'
    }
    msg2send.embeds.push(enemyMsg)
  }
  return msg2send
}
