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
const { getPlayerAC, getGuildId, getImg } = require('src/helpers')

module.exports = async(obj = {}, opt= {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'you do not have discord linked to allycode' }


  let pObj = await getGuildId( {}, {allyCode: allyCode}, opt)
  if(!pObj?.guildId) return { content: `player with allyCode **${allyCode}** is not in a guild...` }

  let gObj = await getGuild(pObj.guildId)
  if(!gObj?.name) return { content: 'Error getting guild info...'}
  if(!gObj?.recentRaidResult) return { content: 'there is no raid history for '+gObj?.name }

  let raids = sorter([{column: 'endTime', order: 'descending'}], gObj.recentRaidResult)
  if(!raids || raids?.length === 0) return { content: `I could not find any raid results for **${gObj.name}**...`}

  let raidId = opt.raid?.value || raids[0].raidId
  let raidDef = (await mongo.find('raidDef', {_id: raidId}))[0]
  if(!raidDef?.nameKey) return { content: 'Error getting raid definition' }

  let previousScores = getMemberPrevious(raids.find(x=>x.raidId === raidId))
  if(!previousScores?.guildRewardScore) return { content: 'Error getting previous scores'}

  let raidData = { name: gObj.name, gp: gObj.gp, nameKey: raidDef.nameKey, guildTotal: previousScores?.guildRewardScore, leaderBoard: [], date: previousScores.endTime }
  for(let i in gObj.member){
    raidData.leaderBoard.push({ playerId: gObj.member[i].playerId, name: gObj.member[i].playerName, score: +(previousScores.scores[gObj.member[i].playerId]?.score || 0) })
  }
  let sort = opt.sort?.value || 'score', sortOrder = 'descending'
  if(sort !== 'score') sortOrder = 'ascending'
  raidData.leaderBoard = sorter([{ column: sort, order: sortOrder}], raidData.leaderBoard || [])
  if(!raidData?.leaderBoard || raidData?.leaderBoard?.length === 0) return { content: 'error calculating data' }

  let webHtml = await getHTML.history(raidData)
  if(!webHtml) return { content: 'Error getting html' }

  let webImg = await getImg(webHtml, obj.id, 100, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: gObj?.name+'-'+raidId+'-raid.png' }
}
