'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')

const getData = require('./getData')
const getMissing = require('./getMissing')

const { getDiscordAC, replyTokenError, replyComponent } = require('src/helpers')
const mapSpecialMissions = (coverts = [], conflicts = [], obj)=>{
  let res = {}
  for(let i in coverts){
    if(!coverts[i]?.zoneDefinition) continue
    let conflict = conflicts.find(x=>x?.zoneDefinition?.zoneId === coverts[i].zoneDefinition.linkedConflictId)?.zoneDefinition
    if(!conflict) continue
    if(!res[conflict.phase]) res[conflict.phase] = { phase: conflict.phase, missions: [] }
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
  if(obj.confirm?.response === 'no' || obj.confirm?.cancel) return { content: 'command canceled', components: [] }

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
  let tbSM = await mongo.find('tbSpecialMission', { tbId: guildData.definitionId})
  tbSM = sorter([{ column: 'phaseNum', order: 'ascending'}], tbSM || [])
  if(!tbSM || tbSM?.length === 0) return { content: 'Error getting TB definition from db...' }

  let mission = opt.mission?.value || obj.confirm?.sm
  if(mission){
    obj.data.options.mission = { name: 'mission', value: mission }
    delete obj.confirm.sm
  }
  if(!mission){

    let x = 0, msg2send = {
      content: 'please select the Special Mission from below.',
      components: []
    }
    for(let i in tbSM){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      let buttonLabel = `${tbSM[i].phase}-${tbSM[i].conflict} ${tbSM[i].zoneName} SM-${tbSM[i].id?.slice(-1) || '1'}`
      if(tbSM[i].rewardZone) buttonLabel = `${tbSM[i].phase} ${tbSM[i].rewardZone} unlock`
      if(tbSM[i].rewardUnit?.nameKey) buttonLabel = `${tbSM[i].phase} ${tbSM[i].rewardUnit.nameKey} shard`
      msg2send.components[x].components.push({
        type: 2,
        label: buttonLabel,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user.id, sm: tbSM[i].id })
      })
      if(msg2send.components[x].components.length == 5) x++;
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
  let specialMission = tbSM.find(x=>x.id === mission)
  if(!specialMission?.zoneId) return { content: 'error finding that mission' }

  let events = await getData(obj, opt, dObj, mission, specialMission.zoneId)
  if(events?.content) return { content: events.content }
  if(events === 'GETTING_CONFIRMATION') return
  if(!events?.attempt || events?.attempt?.length === 0) return { content: 'No one has attempted the mission yet' }

  let missing = await getMissing(specialMission, guildData.profile.id, new Set(events.attempt || []))
  if(missing?.content) return missing


  let pass = [], fail = [], passSet = new Set(events.success)
  for(let i in events.attempt){
    if(passSet.has(events.attempt[i])){
      pass.push(events.attempt[i])
    }else{
      fail.push(events.attempt[i])
    }
  }
  let msgTitle = `-${specialMission.conflict} ${specialMission.zoneName} SM-${mission.slice(-1) || '1'}`
  if(specialMission.rewardZone) msgTitle = ` ${specialMission.rewardZone} unlock`
  if(specialMission.rewardUnit?.nameKey) msgTitle = ` ${specialMission.rewardUnit.nameKey} shard`
  let embedMsg = { color: 15844367, title: `${events.profile?.name} ${specialMission.phase}${msgTitle} (${events.covert.successfulAttempts}/${events.covert.playersParticipated})`, description: '' }
  if(fail?.length > 0){
    embedMsg.description += '**Failed**\n```\n'
    for(let i in fail){
      let member = events?.member?.find(x=>x.id === fail[i])
      if(member?.name) embedMsg.description += `${member.name}\n`
    }
    embedMsg.description += '```\n'
  }
  if(pass?.length > 0){
    embedMsg.description += '**Success**\n```\n'
    for(let i in pass){
      let member = events?.member?.find(x=>x.id === pass[i])
      if(member?.name) embedMsg.description += `${member?.name}\n`
    }
    embedMsg.description += '```\n'
  }
  if(missing?.length > 0){
    embedMsg.description += '**Missing**\n```\n'
    for(let i in missing){
      let member = events?.member?.find(x=>x.id === missing[i])
      if(member?.name) embedMsg.description += `${member?.name}\n`
    }
    embedMsg.description += '```\n'
  }
  return { content: null, embeds: [embedMsg], components: []}
}
