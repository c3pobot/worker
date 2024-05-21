'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getGuild = require('./getGuild')
const { truncateString, getGuildId, replyButton } = require('src/helpers')
const projection = { playerId: 1, name: 1, rosterUnit: { definitionId: 1, skill: 1 } }
module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  let twStatus = (await mongo.find('twStatus', { _id: pObj.guildId }))[0]
  if(!twStatus.enemy) return { content: 'there is no opponent guild registerd' }

  await replyButton(obj, 'Fetching guild data...')
  let [ gObj, eObj ] = await Promise.allSettled([
    getGuild(pObj.guildId, twStatus.joined, projection),
    getGuild(twStatus.enemy, [], projection)
  ])
  gObj = gObj?.value, eObj = eObj?.value
  if(!gObj?.member) return { content: 'error getting home guild data' }
  if(!eObj?.member) return { content: 'error getting away guild data' }

  let skills = await mongo.find('omicronList', { omicronMode: 8 })
  if(!skills || skills?.length == 0) return { content: 'There was no omicron data in the DB' }

  let tempObj = {}
  for(let i in skills){
    if(!tempObj[skills[i].unitBaseId]) tempObj[skills[i].unitBaseId] = { unitBaseId: skills[i].unitBaseId, unitNameKey: skills[i].unitNameKey, skills: {} }
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

  let omiSkills = sorter([{column:'unitNameKey', order: 'ascending'}], Object.values(tempObj) || [])
  if(!omiSkills || omiSkills?.length == 0) return { content: 'Error crunching numbers..' }

  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: 'TW Omicron comparison',
    description: `[${gObj.name}](https://swgoh.gg/g/${gObj.id}/omicrons) vs [${eObj.name}](https://swgoh.gg/g/${eObj.id}/omicrons)\n`,
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
  return { content: null, embeds: [embedMsg] }
}
