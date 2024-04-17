'use strict'
const mongo = require('mongoclient')

const getPlatoonConfig = require('./getPlatoonConfig')
const { getPlayerAC, getOptValue, replyButton, buttonPick, fetchPlayer } = require('src/helpers')

module.exports = async(obj ={}, opt = [])=>{
  let msg2send = {content: "You do not have allyCode linked to discord Id"}
  let tbId = getOptValue(opt, 'tb-name', 't05D')

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send


  let tbDay = obj.confirm?.tbDay
  if(obj.confirm) await replyButton(obj)
  let pObj = await getGuildId({ dId: obj.member?.id}, {allyCode: allyCode})
  if(!pObj?.guildId) return { content: 'Error getting guildId' }

  if(!tbDay){
    let pConfig = await getPlatoonConfig(pObj?.guildId, tbId)
    if(!pConfig || pConfig?.length === 0) return { content: 'Your guild does not have any platoon info configured' }
    let embedMsg = {
      content: 'Please select the round for the platoons you want to see?',
      components: [],
      flags: 64
    }
    let x = 0
    for(let i in pConfig){
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Round-'+pConfig[i].round,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, tbDay: +pConfig[i].round})
      })
      if(embedMsg.components[x].components.length == 5) x++;
    }
    if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
    embedMsg.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 1,
      custom_id: JSON.stringify({id: obj.id, tbDay: 'none'})
    })
    await buttonPick(obj, embedMsg)
    return
  }

  let pCache = (await mongo.find('tbPlatoonCache', {_id: pObj?.guildId+'-'+tbDay+'-'+tbId}))[0]?.platoons
  if(!pCache || pCache?.length === 0) return { content: 'Your guild does not have the platoons cached for Round '+tbDay+'. Run the `/tb platoons` command to cache the data'}

  let count = 0
  let embedMsg = {
    color: 15844367,
    title: pObj.name+' platoons for Round '+tbDay,
    description: ''
  }
  for(let i in pCache){
    if(pCache[i].squads?.length > 0){
      let tempStr
      for(let s in pCache[i].squads){
        let units = pCache[i].squads[s].units?.filter(x=>x.allyCode === pObj.allyCode)
        if(units?.length > 0){
          if(!tempStr) tempStr = pCache[i].id+' '+pCache[i].type+' '+pCache[i].nameKey+'\n'
          tempStr += 'Squad '+pCache[i].squads[s].num+'\n```\n'
          for(let u in units){
            count++;
            tempStr += units[u].nameKey+'\n'
          }
          tempStr += '```\n'
        }
      }
      if(tempStr) embedMsg.description += tempStr
    }
  }
  if(count === 0) embedMsg.description = 'You have no units for these platoons'
  msg2send.content = null
  msg2send.embeds = [embedMsg]
  return msg2send
}
