'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const { getGuildId, truncateString } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your allycode linked to discord id'}, omiSkills
  let pObj = await getGuildId({dId: obj.member?.user?.id}, {}, opt)
  if(!pObj.guildId) return msg2send

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  let twStatus = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
  let joined = twStatus?.joined?.map(x=>x.playerId) || []
  let enemyId = twStatus?.enemy
  if(!enemyId) return { content: 'There is no opponent guild registered' }



  let [ gObj, eObj ] = await Promise.all([
    swgohClient.post('fetchTWGuild', {token: obj.token, id: pObj.guildId, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, skill: 1}}})
    swgohClient.post('fetchTWGuild', {token: obj.token, id: enemyId, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, skill: 1}}})
  ])
  if(gObj?.member?.length > 0 && joined?.length > 0 && gObj.member.length > joined.length) gObj.member = gObj.member.filter(x=>joined.includes(x.playerId))
  if(!gObj?.member || !eObj?.member) return { content: 'Error getting guild info...'}

  let skills = await mongo.find('omicronList', {omicronMode: 8})
  if(!skills || skills?.length == 0) return { content: 'There was no omicron data in the DB ' }

  let tempObj = {}
  for(let i in skills){
    if(!tempObj[skills[i].unitBaseId]) tempObj[skills[i].unitBaseId] = {unitBaseId: skills[i].unitBaseId, unitNameKey: skills[i].unitNameKey, skills: {}}
    if(tempObj[skills[i].unitBaseId] && !tempObj[skills[i].unitBaseId].skills[skills[i].id]){
      tempObj[skills[i].unitBaseId].skills[skills[i].id] = JSON.parse(JSON.stringify(skills[i]))
      tempObj[skills[i].unitBaseId].skills[skills[i].id].homeCount = 0
      tempObj[skills[i].unitBaseId].skills[skills[i].id].awayCount = 0
    }
    if(tempObj[skills[i].unitBaseId].skills[skills[i].id]){
      tempObj[skills[i].unitBaseId].skills[skills[i].id].homeCount += +(gObj.member.filter(x=>x.rosterUnit.some(u=>u.skill.filter(s=>s.id == skills[i].id && +(s.tier + 2) >= skills[i].omiTier).length>0)).length || 0)
      tempObj[skills[i].unitBaseId].skills[skills[i].id].awayCount += +(eObj.member.filter(x=>x.rosterUnit.some(u=>u.skill.filter(s=>s.id == skills[i].id && +(s.tier + 2) >= skills[i].omiTier).length>0)).length || 0)
    }
  }
  tempObj = Object.values(tempObj)
  if(tempObj.length > 0) omiSkills = sorter([{column:'unitNameKey', order: 'ascending'}], tempObj)
  if(!omiSkills || omiSkills?.length === 0) return { content: 'Error crunching numbers..' }

  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: 'TW Omicron comparison',
    description: '['+gObj.name+'](https://swgoh.gg/g/'+gObj.id+'/omicrons/) ('+gObj.member.length+') vs ['+eObj.name+'](https://swgoh.gg/g/'+eObj.id+'/omicrons/) ('+eObj.member.length+')\n',
    footer: {
      text: "Data Updated"
    }
  }
  for(let i in omiSkills){
    let tempSkills = Object.values(omiSkills[i].skills)
    if(tempSkills.filter(x=>x.homeCount || x.awayCount).length > 0){
      embedMsg.description += '**'+omiSkills[i].unitNameKey+'**\n'
      embedMsg.description += '```autohotkey\n'
      for(let s in tempSkills){
        if(tempSkills[s].homeCount || tempSkills[s].awayCount){
          embedMsg.description += (tempSkills[s].homeCount || 0).toString().padStart(2, ' ')+' vs '+(tempSkills[s].awayCount || 0).toString().padEnd(2, ' ')+' : '
          embedMsg.description += tempSkills[s].id.toString().charAt(0).toUpperCase()+' : '+truncateString(tempSkills[s].nameKey, 12)+'\n'
        }
      }
      embedMsg.description += '```'
    }
  }
  msg2send.content = null
  msg2send.embeds = [embedMsg]
  return msg2send
}
