'use strict'
const { configMaps } = require('helpers/configMaps')
const { mongo, GetGuildId, GetOptValue, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const playerProject = require('./playerProject')
const getUnits = require('./getUnits')
const getTwRecord = require('./getTwRecord')
const getHTML = require('getHTML/tw/report')
module.exports = async(obj, opt = [], fromUpdate = false)=>{
  try{
    let msg2send = {content: 'You do not have your allycode linked to discord id'}, joined = [], enemyId, gObj, eObj, guild, webHTML, webImg, webData, cacheKey
    let includeUnits = GetOptValue(opt, 'units', true)
    if(opt.find(x=>x.name == 'units')) includeUnits = opt.find(x=>x.name == 'units').value
    let pObj = await GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj?.guildId){
      cacheKey = pObj?.guildId
      if(includeUnits) cacheKey += '-units'
      webData = (await mongo.find('twReportCache', {_id: cacheKey}))[0]
    }
    if(pObj?.guildId && !webData){
      msg2send.content = 'There is no opponent guild registered'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      let twStatus = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(twStatus?.joined) joined = twStatus.joined
      if(twStatus?.enemy) enemyId = twStatus.enemy
    }
    if(enemyId){
      msg2send.content = 'Error getting home guild info'
      await ReplyButton(obj, 'Pulling home guild data ...')
      gObj = await swgohClient('fetchTwGuild', { id: pObj.guildId, initial: fromUpdate, playerProject: playerProject, joined: joined })
    }
    if(gObj?.member?.length > 0){
      msg2send.content = 'Error getting away guild info'
      await ReplyButton(obj, 'Pulling away guild data ...')
      eObj = await swgohClient('fetchTwGuild', { id: enemyId, initial: fromUpdate, playerProject: playerProject })
    }
    if(eObj?.member?.length > 0){
      await ReplyButton(obj, 'Starting the report creation...')
      webData = {home: {...gObj.profile, ...gObj.summary}, away: {...eObj.profile,...eObj.summary}}
      webData.home.record = getTwRecord(gObj.recentTerritoryWarResult)
      webData.away.record = getTwRecord(eObj.recentTerritoryWarResult)
      if(includeUnits){
        let glUnits = configMaps.FactionMap['galactic_legend']?.units
        let charUnits = guild.units?.filter(x=>x.combatType === 1 && !glUnits.includes(x.baseId))?.map(x=>x.baseId)
        let shipUnits = guild.units?.filter(x=>x.combatType === 2)?.map(x=>x.baseId)
        if(glUnits?.length > 0){
          webData.gl = {}
          webData.gl.home = getUnits(gObj, glUnits)
          webData.gl.away = getUnits(eObj, glUnits)
        }
        if(charUnits?.length > 0){
          webData.char = {}
          webData.char.home = getUnits(gObj, charUnits)
          webData.char.away = getUnits(eObj, charUnits)
        }
        if(shipUnits?.length > 0){
          webData.ship = {}
          webData.ship.home = getUnits(gObj, shipUnits)
          webData.ship.away = getUnits(eObj, shipUnits)
        }
        webData.home.joined = gObj.member.length
        webData.away.joined = eObj.member.length

      }
      mongo.set('twReportCache', {_id: cacheKey}, webData)
      mongo.set('webTemp', {_id: 'tw'}, {data: webData})
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
      msg2send.fileName = 'tb-status.png'
    }
    if(msg2send.content && fromUpdate) msg2send.content += '\nNote: Your opponent guild was successfully added so you can just re-run the `/tw report` to try to get the details'
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
