'use strict'
const GAReport = require('src/cmds/ga/report')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, allyCodes = [], sendResponse = 1, gaInfo
    const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
    const tempAllyCodes = HP.GetOptValue(opt, 'allycodes')
    if(tempAllyCodes) allyCodes = tempAllyCodes.replace(/-/g, '').split(' ')
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'Error with provided info'
      gaInfo = await GetGAInfo(dObj.allyCode)
      if(!gaInfo) gaInfo = {enemies: [], units: []}
    }
    if(dObj && dObj.allyCode && allyCodes.length > 0){
      msg2send.content = 'You can only have 7 opponents registered. You currently have **'+gaInfo.enemies.length+'** and tried to register **'+allyCodes.length+'**'
      if((7 - +gaInfo.enemies.length - +allyCodes.length) >= 0){
        await HP.ReplyButton(obj, 'Pulling opponent data ...')
        for(let i in allyCodes){
          const pObj = await Client.post('fetchGAPlayer', {id: allyCodes[i].trim(), opponent: dObj.allyCode}, null)
          if(pObj && pObj.allyCode){
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
        sendResponse = 0
        GAReport(obj, opt, dObj, gaInfo)
      }
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
