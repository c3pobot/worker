'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').counter

const { botSettings } = require('src/helpers/botSettings')
const { dataList } = require('src/helpers/dataList')
const { getImg, replyComponent, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}, mode = obj.subCmdGroup || obj.subCmd || '5v5'
    if(mode !== '5v5' && mode !== '3v3') return { content: 'unknown ga mode' }
    if(!dataList?.unitList) return { content: 'unitList data is empty..' }

    let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }, { settings: 1 }))[0]
    let defaultSettings = dObj?.settings?.ga
    let leader = opt.leader?.value, season = opt.season?.value, exclude_gl = opt.exclude_gl?.value || false, sort = opt.sort?.value || defaultSettings?.sort || 'rate', singleUnit = opt.single_unit?.value || false
    let minBattles = opt.battles?.value || defaultSettings?.battles || 2, battleLimit = opt.limit?.value || defaultSettings?.limit || 10, league = opt.league?.value || 'KYBER'
    if(!season && botSettings['ga-'+mode]) season = botSettings['ga-'+mode]
    if(!season) return { content: 'you did not specify a proper season' }

    let method = 'PATCH', skip = +(obj.confirm?.skip || 0), totalBattles = +(obj.confirm?.t || 0), numCounters = +(obj.confirm?.n || 0)
    if(minBattles >= 0) minBattles = +minBattles
    if(battleLimit >= 0) battleLimit = +battleLimit
    if(battleLimit > 50) battleLimit = 50
    if(obj.confirm) method =  'POST'
    let info = { league: league, battles: minBattles, limit: battleLimit, exclude_gl: exclude_gl, leader: leader, units: [] }
    for(let i in opt){
      if(i?.startsWith('unit')){
        let baseId = opt[i].value?.toString()?.toUpperCase()?.trim()
        if(!baseId || !dataList.unitList) continue;
        if(dataList.unitList[baseId]) info.units.push(baseId)
      }
    }
    if((!leader || !dataList.unitList[leader]) && info.units?.length == 0) return { content: 'you did not any units' }

    let pipeline = [], countPipeline = [], searchString = '^'+season+'-cleanup-'
    let msg2send = { content:  'No results found' }
    if(leader){
      msg2send.content += 'No results found for **'+dataList?.unitList[leader]?.name+'**'
      searchString += 'd'+leader+'-'
    }

    if(info?.units?.length > 0){
      info.units.sort()
      msg2send.content += ' with units'
      for(let i in info.units){
        searchString += '.*d'+info.units[i]+'-'
        msg2send.content += ' '+dataList.unitList[info.units[i]].name
      }
    }
    if(exclude_gl) msg2send.content += ' exclude_gl'
    if(!leader) pipeline.push({
        $match:
        {
          noLead: true
        }
      })
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
    if(!leader) countPipeline.push({
        $match:
        {
          noLead: true
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
    let payload = {_id: {$regex: searchString}, total: {$gte: +minBattles}, rate: {$gte: 0} }
    if(exclude_gl) payload.attackGl = false
    if(singleUnit) payload.defendUnitCount = 1
    let tempSquads = await mongo.aggregate('gaCounter', payload, pipeline)
    if(!tempSquads || tempSquads?.length == 0) return msg2send
    if(!totalBattles){
      let countSquads = (await mongo.aggregate('gaCounter', payload, countPipeline))[0]
      totalBattles = +(countSquads?.total || 0)
    }
    if(!numCounters) numCounters = await mongo.count('gaCounter', payload)

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
    info.season = season, info.mode = mode, info.total = totalBattles
    info.header = 'GAC Season '+season+' '+mode+' '+(dataList.unitList[leader]?.name || dataList.unitList[info?.units[0]]?.name)+' Cleanup Counters in '+totalBattles+' <br>'+numCounters+' total counters'

    let actionRow = [{ type: 1, components: [] }]
    if(skip > 0) actionRow[0].components.push({
      type: 2,
      label: 'Previous '+battleLimit,
      style: 1,
      custom_id: JSON.stringify({t: totalBattles, n: numCounters, skip: skip - battleLimit, dId: obj.member?.user?.id, id: obj.id })
    })
    if(numCounters > skip + battleLimit) actionRow[0].components.push({
      type: 2,
      label: 'Next '+battleLimit,
      style: 1,
      custom_id: JSON.stringify({t: totalBattles, n: numCounters, skip: skip + battleLimit, dId: obj.member?.user?.id, id: obj.id })
    })

    if(actionRow[0].components.length == 0) actionRow = []
    let webData = await getHTML(squads, info)
    if(!webData) return { content: 'error getting html' }

    let webImg = await getImg(webData, obj.id, 1025, false)
    if(!webImg) return { content: 'error getting image' }
    await replyComponent(obj, { content: null, file: webImg, fileName: info.season+'-'+info.mode+'-cleanup.png', components: actionRow || [] }, method)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
