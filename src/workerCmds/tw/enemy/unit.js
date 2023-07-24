'use strict'
const { configMaps } = require('helpers/configMaps')
const { mongo, DeepCopy, FindUnit, GetGuildId, GetOptValue, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const getHTML = require('getHTML/guild/unit')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discord'}, guildId, enemyId, gObj, gLevel = 0, rLevel = 0, units, uInfo, webData, webHTML, webImg
    let baseId = obj.confirm?.baseId
    if(obj.confirm) await ReplyButton(obj, 'Getting info for **'+configMaps?.UnitMap[baseId]?.nameKey+'** ...')
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    if(baseId === 'GETTING_CONFIRMATION') return
    if(baseId) uInfo = (await mongo.find('unitList', {_id: baseId} ))[0]
    if(!uInfo?.nameKey){
      await ReplyMsg(obj, { content: 'Error finding Unit'})
      return
    }
    let gOption = GetOptValue(opt, 'option')
    let gValue = GetOptValue(opt, 'value')
    if(gOption && gValue){
      if(gOption === 'g') gLevel = +gValue
      if(gOption === 'r') rLevel = +gValue
    }
    let pObj = await GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj?.guildId){
      msg2send.content = 'There is no opponent guild registered'
      guildId = pObj.guildId
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'Error getting guild Info'
      gObj = await swgohClient('fetchTwGuild', {id: enemyId, playerProject: {name: 1, playerId: 1, roster: { [baseId]: 1 } } })
    }
    if(gObj){
      msg2send.content = 'No one in the guild has **'+configMaps?.UnitMap[baseId]?.nameKey+'**'+(rLevel ? ' at **R'+(rLevel - 2)+'** or higher':'')+(gLevel ? ' at **G'+gLevel+'** or higher':'')
      units = gObj.member.filter(x=>x.roster && x.roster[baseId] && x.roster[baseId].relicTier >= rLevel && x.roster[baseId]?.gearTier >= gLevel).map(m=>{
        return Object.assign({}, {
          member: m.name,
          playerId: m.playerId,
          sort: m.roster[baseId].sort,
          unit: m.roster[baseId]
        })
      })
      units = sorter([{column: 'sort', order: 'ascending'}], units)
    }
    if(units?.length > 0){
      webData = { uInfo: uInfo, units: units, profile: gObj.profile, updated: gObj.updated }
      mongo.set('webTemp', {_id: 'guildUnit'}, { data: webData })
    }
    if(webData){
      msg2send.content = 'error getting html'
      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'error getting screen shot'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'guild-'+baseId+'.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
