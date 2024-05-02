'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').counter

const { botSettings } = require('src/helpers/botSettings')
const { dataList } = require('src/helpers/dataList')
const { getImg, saveCmdOptions, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}, mode = obj.subCmdGroup || obj.subCmd || '5v5'
    if(mode !== '5v5' || mode !== '3v3') return { content: 'unknown ga mode' }
    if(!dataList?.unitList) return { content: 'unitList data is empty..' }

    let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }, { settings: 1 }))[0]
    let defaultSettings = dObj?.settings?.ga
    let leader = opt.leader?.value, season = opt.season?.value, gl_only = opt.gl_only?.value || false, sort = opt.sort?.value || defaultSettings?.sort || 'rate'
    if(!leader || !dataList.unitList[leader]) return { content: 'you did not specify a valid leader' }

    let minBattles = opt.battles?.value || 2, battleLimit = opt.limit?.value || 10, league = opt.league?.value || 'KYBER'
    if(!season && botSettings['ga-'+mode]) season = botSettings['ga-'+mode]
    if(!season) return { content: 'you did not specify a proper season' }

    let method = 'PATCH', skip = +(obj.confirm?.skip || 0), countSquads
    if(minBattles >= 0) minBattles = +minBattles
    if(battleLimit >= 0) battleLimit = +battleLimit
    if(battleLimit > 50) battleLimit = 50
    if(obj.confirm) method =  'POST', countSquads = JSON.parse(JSON.stringify(obj.confirm))
    let info = { league: league, battles: minBattles, limit: battleLimit, gl_only: gl_only, leader: leader, units: [] }
    for(let i in opt){
      if(i?.startsWith('unit')){
        let baseId = opt[i].value?.toString()?.toUpperCase()?.trim()
        if(!baseId || !dataList.unitList) continue;
        if(dataList.unitList[baseId]) info.units.push(baseId)
      }
    }
    let pipeline = [], countPipeline = [], searchString = '^'+season+'-d.*a'+leader+'-'
    let msg2send = { content: 'No results found for **'+dataList.unitList[leader].name+'**' }
    if(info?.units?.length > 0){
      info.units.sort()
      msg2send.content += ' with units'
      for(let i in info.units){
        searchString += '.*a'+info.units[i]+'-'
        msg2send.content += ' '+dataList.unitList[info.units[i]].name
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
    let payload = {_id: {$regex: searchString}, total: {$gte: +minBattles}, rate: {$gte: 0}, attackLeader: leader}
    if(gl_only) payload.defendGl = true
    let tempSquads = await mongo.aggregate('gaCounter', payload, pipeline)
    if(!tempSquads || tempSquads?.length == 0) return msg2send

    if(!countSquads) countSquads = (await mongo.aggregate('gaCounter', payload, countPipeline))[0]

    let squads = []
    for(let i in tempSquads){
      squads.push({
        defense: tempSquads[i].defendSquad.split('-'),
        attack: tempSquads[i].attackSquad.split('-'),
        win: tempSquads[i].win,
        loss: tempSquads[i].loss,
        seen: tempSquads[i].total,
        rate: tempSquads[i].rate
      })
    }
    if(!squads || squads?.length == 0) return { content: 'error getting squads' }
    info.season = countSquads?._id
    info.mode = countSquads?.mode
    info.total = countSquads?.total
    info.header = 'GAC Season '+countSquads?._id+' '+countSquads?.mode+' '+dataList.unitList[leader].name+' Who to attack in '+countSquads?.total+' battles'

    let actionRow = { type: 1, components: [] }
    if(skip > 0) actionRow.components.push({
      type: 2,
      label: 'Previous '+battleLimit,
      style: 1,
      custom_id: JSON.stringify({...countSquads, skip: skip - battleLimit, dId: obj.member?.user?.id, id: obj.id })
    })
    if(countSquads?.total > skip + battleLimit) actionRow.components.push({
      type: 2,
      label: 'Next '+battleLimit,
      style: 1,
      custom_id: JSON.stringify({...countSquads, skip: skip + battleLimit, dId: obj.member?.user?.id, id: obj.id })
    })

    if(actionRow.components.length == 0) actionRow = []
    let webData = await getHTML(squads, info)
    if(!webData) return { content: 'error getting html' }

    let webImg = await getImg(webData, obj.id, 1025, false)
    if(!webImg) return { content: 'error getting image' }
    await saveCmdOptions(obj)
    await replyMsg(obj, { content: null, file: webImg, fileName: info.season+'-'+info.mode+'-'+info.leader+'.png', components: actionRow || [] }, method)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
