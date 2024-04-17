'use strict'
const getHTML = require('webimg').tbPlatoons
const basicMap = require('./basicMap')
const savedMap = require('./savedMap')
const getPlatoonConfig = require('../getPlatoonConfig')
const { replyButton, getOptValue, getPlayerAC, getGuildId } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj ={}, opt = [])=>{
  let msg2send = { content: 'Your allyCode is not linked to discordId' }
  let tbId = await getOptValue(opt, 'tb-name', 't05D')
  let gObj = await getGuildId({dId: obj.memeber?.user?.id}, {}, opt)
  if(!gObj?.guildId) return msg2send

  let tbDay = obj.confirm?.tbDay
  if(obj.confirm) await replyButton(obj)
  let pDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
  if(!pDef?.platoons || pDef?.platoons?.length === 0) return { content: 'The platoon info is not in the database yet'}

  let guild = await swgohClient.post('fetchGuild', {id: gObj.guildId, projection: {name: 1, playerId: 1, allyCode: 1, guildName: 1, rosterUnit: {sort: 1, definitionId: 1, currentLevel: 1, currentRarity: 1, currentTier: 1, relic: 1, gp: 1, combatType: 1}}})
  if(!guild?.memeber || guild?.member?.length === 0) return { content: 'Error getting guild data...' }

  let pConfig = await getPlatoonConfig(gObj.guildId, tbId)
  if(pConfig?.length > 0 && !tbDay){
    let embedMsg = {
      content: 'You guild has platoon config saved do you want to use one of these?',
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
  let data
  msg2send.content = 'Error calculating data...'
  if(pConfig?.length > 0 && tbDat && tbDay !== 'none'){
    let tempData = (await mongo.find('tbPlatoonCache', {_id: guild?.id+'-'+tbDay+'-'+tbId}))[0]
    if(tempData?.platoons) data = tempData
    if(!data){
      data = savedMap(guild.member, pDef.platoons, pConfig.find(x=>x.id === 'tbPlatoonIds-'+tbDay+'-'+tbId)?.data, tbDay)
      await mongo.set('tbPlatoonCache', {_id: guild?.id+'-'+tbDay+'-'+tbId}, {platoons: data?.platoons, tbId: tbId, guildId: guild.id, tbDay: tbDay})
    }
    if(!data) return msg2send
  }
  if(!data) data = basicMap(guild.member, pDef, opt)
  if(!data?.platoons || data?.platoons?.length === 0) return { content: data?.content || msg2send.content }

  let webData = await getHTML(data.platoons, { nameKey: pDef.nameKey, guild: guild.name })
  if(!webData) return { content: 'Error getting HTML...'}

  let webImg = await getImg(webData, obj.id, 900, false)
  if(!webImg) return { content: 'Error getting image...'}

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'platoons.png'
  return msg2send
}
