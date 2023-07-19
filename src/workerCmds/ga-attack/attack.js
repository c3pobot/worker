'use strict'
const { botSettings } = require('helpers/botSettings')
const { configMaps } = require('helpers/configMaps')
const { mongo, ButtonPick, DeepCopy, GetOptValue, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const GetHTML = require('getHTML/counter')
module.exports = async(obj = {}, opt = [], mode = '5v5')=>{
  try{
    let msg2send = {content: 'you did not specify a valid unit'}, webImg, webHTML, tempSquads, countSquads, squads = [], defaultSettings, skip = 0, method = 'PATCH'
    let dObj = (await mongo.find('discordId', {_id: obj.member?.user?.id}, {settings: 1}))[0]
    if(dObj?.settings?.ga) defaultSettings = dObj.settings.ga
    let leader = await GetOptValue(opt, 'leader')
    let season = await GetOptValue(opt, 'season')
    let gl_only = await GetOptValue(opt, 'gl_only', false)
    let sort = await GetOptValue(opt, 'sort', defaultSettings?.sort || 'rate')
    let minBattles = await GetOptValue(opt, 'battles', defaultSettings?.battles || 2)
    let battleLimit = await GetOptValue(opt, 'limit', defaultSettings?.limit || 10)
    let league = await GetOptValue(opt, 'league', 'KYBER')
    if(minBattles >= 0) minBattles = +minBattles
    if(battleLimit >= 0) battleLimit = +battleLimit
    if(battleLimit > 50) battleLimit = 50
    if(!season && botSettings.map['ga-'+mode]) season = botSettings.map['ga-'+mode]
    if(obj.confirm){
      method = 'POST'
      await ReplyButton(obj, 'Getting '+battleLimit+' more ...')
      skip = +obj.confirm.skip
      countSquads = JSON.parse(JSON.stringify(obj.confirm))
      if(skip < 0) skip = 0
    }
    let info = { league: league, battles: minBattles, limit: battleLimit, gl_only: gl_only, leader: leader, units: [] }
    for(let i in opt){
      if(opt[i]?.name?.startsWith('unit')){
        let baseId = opt[i].value?.toString()?.toUpperCase()?.trim()
        if(baseId && configMaps.UnitMap[baseId]) info.units.push(baseId)
      }
    }
    if(leader && configMaps.UnitMap[leader] && season){
      msg2send.content = 'No results found for **'+configMaps.UnitMap[leader].nameKey+'**'
      let pipeline = [], countPipeline = [], searchString = '^'+season+'-d.*a'+leader+'-'
      if(info?.units?.length > 0){
        await info.units.sort()
        msg2send.content += ' with units'
        for(let i in info.units){
          searchString += '.*a'+info.units[i]+'-'
          msg2send.content += ' '+configMaps.UnitMap[info.units[i]].nameKey
        }
      }
      if(gl_only) msg2send.content += ' gl_only'
      pipeline.push({
        $project: {
          _id: 1,
          attackSquad: 1,
          defendSquad: 1,
          mode: 1,
          season: 1,
          total: 1,
          rate: 1
        }
      })
      countPipeline.push({
        $project: {
          _id: 1,
          total: 1,
          mode: 1,
          season: 1
        }
      })
      countPipeline.push({
        $group: {
            _id: '$season',
            mode: { $first: '$mode'},
            total: { $sum : '$total'}
        }
      })
      if(sort === 'rate'){
        pipeline.push({ $sort: { rate: -1 } })
      }else{
        pipeline.push({ $sort: { total: -1 } })
      }
      pipeline.push({ $skip: +skip})
      pipeline.push({ $limit: +battleLimit })
      const payload = {_id: {$regex: searchString}, total: {$gte: +minBattles}, rate: {$gte: 0}, attackLeader: leader}
      if(gl_only) payload.defendGl = true
      tempSquads = await mongo.aggregate('gaCounter', payload, pipeline)
      if(!countSquads) countSquads = (await mongo.aggregate('gaCounter', payload, countPipeline))[0]
    }
    if(countSquads?._id) countSquads.id = obj.id
    if(tempSquads?.length > 0){
      tempSquads.forEach(s=>{
        const tempSquad = {
          defense: s.defendSquad.split('-'),
          attack: s.attackSquad.split('-'),
          win: s.win,
          loss: s.loss,
          seen: s.total,
          rate: s.rate
        }
        squads.push(tempSquad)
      })
      if(squads?.length > 0){
        info.season = countSquads?._id
        info.mode = countSquads?.mode
        info.total = countSquads?.total
        info.header = 'GAC Season '+countSquads?._id+' '+countSquads?.mode+' '+configMaps.UnitMap[leader].nameKey+' Who to attack in '+countSquads?.total+' battles'
      }
    }
    if(squads?.length < countSquads?.total){
      let actionRow = { type: 1, components: []}
      if(skip > 0) actionRow.components.push({
        type: 2,
        label: 'Previous '+battleLimit,
        style: 1,
        custom_id: JSON.stringify({...countSquads, skip: skip - battleLimit})
      })
      if(countSquads?.total > skip + battleLimit) actionRow.components.push({
        type: 2,
        label: 'Next '+battleLimit,
        style: 1,
        custom_id: JSON.stringify({...countSquads, skip: skip + battleLimit})
      })
      if(actionRow.components.length > 0) msg2send.components = [actionRow]
    }
    if(squads.length > 0 && info?.header){
      msg2send.content = 'Error getting html'
      webHTML = await GetHTML({squads: squads, info: info})
    }
    if(webHTML){
      msg2send.content = 'Error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = info.season+'-'+info.mode+'-'+info.leader+'.png'
    }
    if(msg2send.components){
      await ButtonPick(obj, msg2send, method)
    }else{
      await ReplyMsg(obj, msg2send)
    }
  }catch(e){
    throw(e)
  }
}
