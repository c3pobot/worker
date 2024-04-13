'use strict'
const mongo = require('mongoclient')
const gaReport = require('src/cmds/ga/report')
const { getOptValue, getDiscordAC  } = require('src/helpers')
const { getGAInfo } = require('src/cmds/ga/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, allyCodes = [], gaInfo, availableSpace = 7
  let tempAllyCodes = getOptValue(opt, 'allycodes')
  if(tempAllyCodes) allyCodes = tempAllyCodes.replace(/-/g, '').split(' ')
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = 'Error with provided info'
    gaInfo = await getGAInfo(dObj.allyCode)
    if(!gaInfo) gaInfo = {enemies: [], units: []}
    availableSpace = availableSpace - +gaInfo?.enemies?.length
  }
  if(allyCodes?.length > 0) availableSpace = availableSpace - +allyCodes.length
  if(availableSpace === 0) msg2send.content = 'You can only have 7 opponents registered. You currently have **'+gaInfo.enemies.length+'** and tried to register **'+allyCodes.length+'**'
  if(dObj?.allyCode && availableSpace > 0){
    await replyButton(obj, 'Pulling opponent data ...')
    for(let i in allyCodes){
      let pObj = await swgohClient.post('fetchGAPlayer', {id: allyCodes[i].trim(), opponent: dObj.allyCode}, null)
      if(pObj?.allyCode){
        if(gaInfo.enemies.filter(x=>x.playerId == pObj.playerId).length == 0){
          gaInfo.enemies.push({
            playerId : pObj.playerId,
            allyCode: pObj.allyCode,
            name: pObj.name
          })
        }
      }
    }
    if(gaInfo.enemies.length > 0) gaInfo.currentEnemy = gaInfo.enemies[(gaInfo.enemies.length - 1)].playerId;
    await mongo.set('ga', {_id: dObj.allyCode.toString()}, gaInfo);
    msg2send = await gaReport(obj, opt, dObj, gaInfo)
  }
  return msg2send
}
