'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const getData = require('./getData')

const { getDiscordAC, replyTokenError, replyComponent } = require('src/helpers')
const mapSpecialMissions = (coverts = [], conflicts = [], obj)=>{
  let res = {}
  for(let i in coverts){
    if(!coverts[i]?.zoneDefinition) continue
    let conflict = conflicts.find(x=>x?.zoneDefinition?.zoneId === coverts[i].zoneDefinition.linkedConflictId)?.zoneDefinition
    if(!conflict) continue
    if(!res[conflict.phase]) res[conflict.phase] = { phase: conflict.phase, missions: [] }
    //if(res[conflict.phase]) res[conflict.phase].missions.push({ phase: conflict.phase, conflict: conflict.conflict, zoneId: converts[i].zoneDefinition.zoneId, num: converts[i].zoneDefinition.zoneId?.slice(-1) || '1' })
    if(res[conflict.phase]) res[conflict.phase].missions.push({
      type: 2,
      label: `${conflict.phase}-${conflict.conflict} ${conflict.nameKey} SM-${coverts[i].zoneDefinition.zoneId?.slice(-1) || '1'}`,
      style: 1,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, sm: coverts[i].zoneDefinition.zoneId })
    })
  }
  return sorter([{column: 'phase', order: 'ascending'}], Object.values(res) || [])
}

module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google auth linked to your discordId' }

  let guildData = (await mongo.find('tbSMCache', { _id: dObj.uId }))[0]
  if(guildData?._id) await mongo.del('tbSMCache', { _id: dObj.uId })
  if(!guildData){
    let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
    if(gObj === 'GETTING_CONFIRMATION') return
    if(gObj?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
    if(!gObj?.data?.guild) return { content: 'Error getting guild data' }

    gObj = gObj.data.guild
    if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}
    guildData = gObj.territoryBattleStatus[0]
    guildData.profile = gObj.profile
    await mongo.set('tbSMCache', { _id: dObj.uId }, guildData)
  }

  let tbDef = (await mongo.find('tbDefinition', { _id:  guildData.definitionId }))[0]
  if(!tbDef?._id) return { content: 'Error getting TB definition from db...' }

  let mission = opt.mission?.value || obj.confirm?.sm
  if(mission){
    obj.data.options.mission = { name: 'mission', value: mission }
    delete obj.confirm.sm
  }
  if(!mission){
    let coverts = mapSpecialMissions(tbDef.covertZoneDefinition, tbDef.conflictZoneDefinition, obj)
    if(!coverts || coverts?.length === 0) return { content: 'Error mapping special missions' }
    let x = 0, msg2send = {
      content: 'please select the Special Mission from below.',
      components: []
    }
    for(let i in coverts){
      if(!coverts[i].missions || coverts[i]?.missions?.length === 0) continue
      for(let m in coverts[i].missions){
        if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
        msg2send.components[x].components.push(coverts[i].missions[m])
        if(msg2send.components[x].components.length == 5) x++;
      }
    }
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, cancel: true })
    })
    await replyComponent(obj, msg2send)
    return
  }
  let zoneId = tbDef?.covertZoneDefinition?.find(x=>x?.zoneDefinition?.zoneId === mission)?.zoneDefinition?.linkedConflictId
  if(!zoneId) return { content: 'Error getting zoneId'}
  let events = await getData(obj, opt, dObj, mission, zoneId)
  if(events?.content) return { content: events.content }
  if(events === 'GETTING_CONFIRMATION') return
  if(!events?.missionLogs || events?.missionLogs?.length === 0) return { content: 'there are no logs available for the event' }

  let zoneDef = tbDef.conflictZoneDefinition?.find(x=>x.zoneDefinition?.zoneId === zoneId)?.zoneDefinition
  let pass = [], fail = [], passSet = new Set(events.mainLogs)
  for(let i in events.missionLogs){
    if(passSet.has(events.missionLogs[i].id)){
      pass.push(events.missionLogs[i])
    }else{
      fail.push(events.missionLogs[i])
    }
  }
  let embedMsg = { color: 15844367, title: `${events.profile?.name} ${zoneDef.phase}-${zoneDef.conflict} ${zoneDef.nameKey} SM-${mission.slice(-1) || '1'} (${events.covert.successfulAttempts}/${events.covert.playersParticipated})`, description: '' }
  if(fail?.length > 0){
    embedMsg.description += '**Failed**\n```\n'
    for(let i in fail) embeMsg.description += `${fail[i].name}\n`
    embedMsg.description += '```\n'
  }
  if(pass?.length > 0){
    embedMsg.description += '**Success**\n```\n'
    for(let i in pass) embeMsg.description += `${pass[i].name}\n`
    embedMsg.description += '```\n'
  }
  embedMsg.description += 'Note: the results may be inaccurate because of the way the logs are only kept for a certain amount of time. Interpret it as you wish.'
  return { content: null, embeds: [embeMsg], components: []}
}
