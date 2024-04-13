'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const gaReport = require('src/cmds/ga/report')
const { buttonPick, getDiscordAC } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, sendResponse = 0, allyCode, gaInfo
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(obj.confirm && obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
  if(dObj && dObj.allyCode){
    msg2send.content = 'You do not have a GA opponent configured'
    gaInfo = await getGAInfo(dObj.allyCode)
  }
  if(obj.confirm?.allyCode) allyCode = +obj.confirm.allyCode
  if(gaInfo?.enemies?.length > 0 && !allyCode){
    let embedMsg = {
      content: 'Please choose GA opponent to set',
      components: [],
      flags: 64
    }
    let x = 0
    let enemies = await sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
    for(let i in enemies){
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: (gaInfo.currentEnemy == enemies[i].playerId ? 'Current - ':'')+enemies[i].name+' ('+enemies[i].allyCode+')',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, allyCode: enemies[i].allyCode})
      })
      if(embedMsg.components[x].components.length == 5) x++;
    }
    await buttonPick(obj, embedMsg)
    return
  }
  if(gaInfo?.enemies?.length > 0 && allyCode){
    msg2send.content = 'Error finding opponent with allyCode **'+allyCode+'**'
    let tempEnemy = gaInfo.enemies.find(x=>x.allyCode == allyCode)
    if(tempEnemy?.playerId){
      await mongo.set('ga', {_id: dObj.allyCode.toString()}, { currentEnemy: tempEnemy.playerId })
      gaInfo.currentEnemy = tempEnemy.playerId
      msg2send = await gaReport(obj, opt, dObj, gaInfo)
    }
  }
  return msg2send
}
