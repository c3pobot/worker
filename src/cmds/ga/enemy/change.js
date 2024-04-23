'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const gaReport = require('src/cmds/ga/report')
const { buttonPick, getDiscordAC } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  let opponent = obj.confirm?.allyCode?.toString()?.trim()
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return msg2send

  let gaInfo = await getGAInfo(dObj.allyCode)
  if(!gaInfo?.enemies || gaInfo?.enemies?.length == 0) return { content: 'You do not have GA opponents configured' }

  if(!opponent){
    let embedMsg = {
      content: 'Please choose GA opponent to set',
      components: [],
      flags: 64
    }
    let x = 0
    let enemies = sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
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

  let tempEnemy = gaInfo.enemies.find(x=>x.allyCode === +opponent)
  if(!tempEnemy?.playerId) return { content: 'Error finding opponent with allyCode **'+opponent+'**' }

  await mongo.set('ga', {_id: dObj.allyCode.toString()}, { currentEnemy: tempEnemy.playerId })
  gaInfo.currentEnemy = tempEnemy.playerId
  msg2send = await gaReport(obj, opt, dObj, gaInfo)

  return msg2send
}
