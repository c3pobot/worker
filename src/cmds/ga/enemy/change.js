'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const gaReport = require('src/cmds/ga/report')

const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.enemies || gaInfo?.enemies?.length == 0) return { content: 'You do not have GA opponents configured' }

  let opponent = obj.confirm?.allyCode?.toString()?.trim()
  if(!opponent){
    let x = 0, msg2send = {
      content: 'Please choose GA opponent to set',
      components: [],
      flags: 64
    }
    let enemies = sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
    for(let i in enemies){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      msg2send.components[x].components.push({
        type: 2,
        label: (gaInfo.currentEnemy == enemies[i].playerId ? 'Current - ':'')+enemies[i].name+' ('+enemies[i].allyCode+')',
        style: 1,
        custom_id: JSON.stringify({ dId: obj.member?.user?.id, allyCode: enemies[i].allyCode})
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ dId: obj.member?.user?.id, cancel: true })
    })
    return msg2send
  }

  let tempEnemy = gaInfo.enemies.find(x=>x.allyCode === +opponent)
  if(!tempEnemy?.playerId) return { content: 'Error finding opponent with allyCode **'+opponent+'**' }

  await mongo.set('ga', {_id: dObj.allyCode.toString()}, { currentEnemy: tempEnemy.playerId })
  gaInfo.currentEnemy = tempEnemy.playerId
  return await gaReport(obj, opt, dObj, gaInfo)
}
