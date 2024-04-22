'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')

const getMemberPrevious = require('./getMemberPrevious')
const getHTML = require('webimg').raid

const getGuild = async(guildId)=>{
  let guild = (await mongo.find('guildCache', {_id: guildId}, { recentRaidResult: 1, gp: 1, name: 1, member: { playerId: 1, playerName: 1}}))[0]
  if(!guild){
    guild = await swgohClient.post('guild', { guildId: guildId, includeRecentGuildActivityInfo: true} )
    if(guild.guild){
      guild = guild.guild
      guild.name = guild.profile?.name
      guild.gp = guild.profile?.guildGalacticPower
    }
  }
  return guild
}
const { getOptValue, getPlayerAC, getGuildId, getImg } = require('src/helpers')

module.exports = async(obj = {}, opt=[])=>{
  let msg2send = { content: 'you do not have discord linked to allycode' }
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }

  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send

  let raidId = getOptValue(opt, 'raid')
  let pObj = await getGuildId({dId: null}, {allyCode: allyCode}, opt)
  if(!pObj?.guildId) return { content: `player with allyCode **${allyCode}** is not in a guild...` }

  let gObj = await getGuild(pObj.guildId)
  if(!gObj?.name) return { content: 'Error getting guild info...'}
  if(!gObj?.recentRaidResult) return { content: 'there is no raid history for '+gObj?.name }

  let raids = sorter([{column: 'endTime', order: 'descending'}], gObj.recentRaidResult)
  if(!raids || raids?.length === 0) return { content: `I could not find any raid results for **${gObj.name}**...`}

  if(!raidId) raidId = raids[0].raidId
  let raidDef = (await mongo.find('raidDef', {_id: raidId}))[0]
  if(!raidDef?.nameKey) return { content: 'Error getting raid definition' }

  let previousScores = getMemberPrevious(raids, raidId)
  if(!previousScores || Object.values(previousScores)?.length === 0) return { content: 'Error getting previous scores'}

  let raidData = {name: gObj.name, gp: gObj.gp, nameKey: raidDef.nameKey, leaderBoard: [] }
  for(let i in gObj.member){
    let tempObj = {playerId: gObj.member[i].playerId, low: 0, high: 0, scores: [], avg: 0}
    if(previousScores[gObj.member[i].playerId]) tempObj = previousScores[gObj.member[i].playerId]
    raidData.leaderBoard.push({...gObj.member[i],...tempObj})
  }
  if(raidData.leaderBoard?.length > 0){
    raidData.leaderBoard = sorter([{column: 'avg', order: 'descending'}], raidData.leaderBoard)
    if(previousScores.guildTotal){
      raidData.leaderBoard.unshift(previousScores.guildTotal)
      raidData.date = 0
      for(let i in previousScores.guildTotal.dates){
        if(+previousScores.guildTotal.dates[i] > raidData.date) raidData.date = +previousScores.guildTotal.dates[i]
      }
    }
  }
  if(!raidData?.leaderBoard || raidData?.leaderBoard?.length === 0) return { content: 'error calculating data' }

  let raidHTML = await getHTML.history(raidData)
  if(!raidHTML) return { content: 'Error getting html' }

  let raidImg = await getImg(raidHTML, obj.id, 100, false)
  if(!raidImg) return { content: 'error getting image' }

  msg2send.content = null
  msg2send.file = raidImg
  msg2send.fileName = gObj?.name+'-'+raidId+'-raid.png'
  return msg2send
}
