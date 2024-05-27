'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').tbPlatoons
const basicMap = require('./basicMap')
const savedMap = require('./savedMap')
const getPlatoonConfig = require('../getPlatoonConfig')
const { getPlayerAC, getGuildId, replyComponent, getImg } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj ={}, opt = {})=>{
  let gObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!gObj?.guildId) return { content: 'Your allyCode is not linked to discordId' }

  let tbId = opt['tb-name']?.value || 't05D'
  let pDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
  if(!pDef?.platoons || pDef?.platoons?.length === 0) return { content: 'The platoon info is not in the database yet' }

  let guild = await swgohClient.post('fetchGuild', { guildId: gObj.guildId, projection: { name: 1, playerId: 1, allyCode: 1, guildName: 1, rosterUnit: {sort: 1, definitionId: 1, currentLevel: 1, currentRarity: 1, currentTier: 1, relic: 1, gp: 1, combatType: 1 }}})
  if(!guild?.member || guild?.member?.length === 0) return { content: 'Error getting guild data...' }

  let tbDay = obj.confirm?.tbDay
  let pConfig = await getPlatoonConfig(gObj.guildId, tbId)
  if(pConfig?.length > 0 && !tbDay){
    let msg2send = {
      content: 'You guild has platoon config saved do you want to use one of these?',
      components: [],
      flags: 64
    }
    let x = 0
    for(let i in pConfig){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
      msg2send.components[x].components.push({
        type: 2,
        label: 'Round-'+pConfig[i].round,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, tbDay: +pConfig[i].round })
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 1,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, tbDay: 'none' })
    })
    await replyComponent(obj, msg2send)
    return
  }

  let data
  if(pConfig?.length > 0 && tbDay && tbDay !== 'none'){
    let tempData = (await mongo.find('tbPlatoonCache', { _id: guild?.id+'-'+tbDay+'-'+tbId }))[0]
    if(tempData?.platoons) data = tempData
    if(!data){
      data = savedMap(guild.member, pDef.platoons, pConfig.find(x=>x.id === 'tbPlatoonIds-'+tbDay+'-'+tbId)?.data, tbDay)
      //await mongo.set('tbPlatoonCache', {_id: guild?.id+'-'+tbDay+'-'+tbId}, {platoons: data?.platoons, tbId: tbId, guildId: guild.id, tbDay: tbDay})
    }
    if(!data) return { content: 'Error calculating saved platoon data...' }
  }
  if(!data) data = basicMap(guild.member, pDef, opt)
  if(!data?.platoons || data?.platoons?.length === 0) return { content: data?.content || 'Error calculating data...' }

  let webData = await getHTML(data.platoons, { nameKey: pDef.nameKey, guild: guild.name })
  if(!webData) return { content: 'Error getting HTML...'}

  let webImg = await getImg(webData, obj.id, 900, false)
  if(!webImg) return { content: 'Error getting image...'}

  return { content: null, file: webImg, fileName: 'platoons.png' }
}
