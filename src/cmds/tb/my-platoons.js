'use strict'
const mongo = require('mongoclient')

const getPlatoonConfig = require('./getPlatoonConfig')
const { getPlayerAC, fetchPlayer, replyComponent, getGuildId } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj ={}, opt = [])=>{
  if(obj.confirm?.cancel) return { content: 'Command canceled' }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: "You do not have allyCode linked to discord Id" }

  let pObj = await fetchPlayer({ allyCode: +allyCode})
  if(!pObj?.guildId) return { content: 'Error getting guildId' }

  let tbId = opt['tb-name']?.value || 't05D', tbDay = obj.confirm?.tbDay
  if(!tbDay){
    let pConfig = await getPlatoonConfig(pObj?.guildId, tbId)
    if(!pConfig || pConfig?.length === 0) return { content: 'Your guild does not have any platoon info configured' }

    let x = 0, msg2send = {
      content: 'Please select the round for the platoons you want to see?',
      components: [],
      flags: 64
    }
    for(let i in pConfig){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
      msg2send.components[x].components.push({
        type: 2,
        label: 'Round-'+pConfig[i].round,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, tbDay: +pConfig[i].round})
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    })
    await replyComponent(obj, msg2send)
    return
  }

  let pCache = (await mongo.find('tbPlatoonCache', {_id: pObj?.guildId+'-'+tbDay+'-'+tbId}))[0]?.platoons
  if(!pCache || pCache?.length === 0) return { content: 'Your guild does not have the platoons cached for Round '+tbDay+'. Run the `/tb platoons` command to cache the data'}

  let count = 0, embedMsg = {
    color: 15844367,
    title: pObj.name+' platoons for Round '+tbDay,
    description: ''
  }
  for(let i in pCache){
    if(!pCache[i]?.squads || pCache[i]?.squads?.length == 0) continue
    let tempStr
    for(let s in pCache[i].squads){
      let units = pCache[i].squads[s].units?.filter(x=>x.allyCode === pObj.allyCode)
      if(!units || units?.length == 0) continue
      if(!tempStr) tempStr = pCache[i].id+' '+pCache[i].type+' '+pCache[i].nameKey+'\n'
      tempStr += 'Squad '+pCache[i].squads[s].num+'\n```\n'
      for(let u in units){
        count++;
        tempStr += units[u].nameKey+'\n'
      }
      tempStr += '```\n'
    }
    if(tempStr) embedMsg.description += tempStr
  }
  if(count === 0) embedMsg.description = 'You have no units for these platoons'
  return { content: null, embeds: [embedMsg] }
}
