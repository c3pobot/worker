'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const json2xls = require('json2xls');
const getMemberPrevious = require('./getMemberPrevious')


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

module.exports = async(obj = {}, opt = {})=>{
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

  let raid = getMemberPrevious(raids.find(x=>x.raidId === raidId))
  if(!raid?.guildRewardScore) return { content: 'Error getting previous scores'}

  let data = []
  for(let i in gObj.member){
    data.push({ name: gObj.member[i].playerName, score: +(raid.scores[gObj.member[i].playerId]?.score || 0) })
  }
  if(!data || data?.length === 0) return { content: 'Error calculating data' }
  let exportFormat = opt.format?.value || 'excel'

  let date = (new Date(raid.endTime * 1000))?.toLocaleDateString()?.replace(/\//g, '-')
  if(exportFormat === 'json'){
    let fileData = Buffer.from(JSON.stringify(data))
    return { content: 'JSON data attached', file: fileData, fileName: `${gObj.name}-raid-history-${date}.json` }
  }
  let excelData = await json2xls(data, { name: 'string', score: 'number' })
  if(!excelData) return { content: 'Error converting to excel' }


  let fileData = Buffer.from(excelData, 'binary')
  if(!fileData) return { content: 'Error converting to buffer' }
  return { content: 'Excel data attached', file: fileData, fileName: `${gObj.name}-raid-history-${date}.xlsx` }
}
