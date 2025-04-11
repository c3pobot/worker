'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').datacron
const { fetchPlayer, getPlayerAC, replyError, getImg } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj?.data?.options || {}
    let datacronSet = opt['datacron-set']?.value || 'all'
    let datacronLvl = opt.level?.value || 3
    if(+datacronLvl >= 0){
      if(datacronLvl > 15 ) datacronLvl = 15
    }else{
      datacronLvl = 3
    }
    if(!datacronSet || !datacronLvl) return { content: 'error with the provided input...' }

    let datacronList = await mongo.aggregate('datacronList', {expirationTimeMs: {$gte: +(Date.now())}}, [{$sort: {_id: -1}}])
    let statMap = (await mongo.find('configMaps', { _id: 'statDefMap'}))[0]?.data
    if(!datacronList || datacronList?.length == 0) return { content: 'Error getting datacronList from db...' }
    if(!statMap) return { content: 'Error getting statMap from db...' }

    let allyObj = await getPlayerAC(obj, opt)
    if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
    let allyCode = allyObj?.allyCode
    if(!allyCode) return { content: 'You do not have discordId linked to allyCode' }

    let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
    if(!pObj.allyCode) return { content: 'Error gettign player data' }
    if(!pObj.datacron || pObj.datacron?.length == 0) return { content: 'That player has no datacrons...' }

    if(datacronSet !== 'all') pObj.datacron = pObj.datacron.filter(x=>x?.setId == +datacronSet)
    if(datacronLvl >= 0) pObj.datacron = pObj.datacron.filter(x=>+x?.affix?.length >= 0 +datacronLvl)
    let pDatacron = pObj.datacron
    if(!pDatacron || pDatacron?.length == 0) return { content: `player has not ${datacronSet} datacron's at or above ${datacronLvl}...` }

    let webData = {dcDef: {}, info: { name: pObj.name, updated: pObj.updated, set: datacronSet, level: datacronLvl }, data: [] }
    for(let i in pDatacron){
      if(!webData.dcDef[pDatacron[i].templateId]) webData.dcDef[pDatacron[i].templateId] = datacronList.find(x=>x.id === pDatacron[i].templateId)
      pDatacron[i].level = +pDatacron[i].affix?.length || 0
      webData.data.push(pDatacron[i])
    }
    if(!webData?.data || webData?.data?.length == 0) return { content: 'Error getting player datacrons' }

    let webHtml = await getHTML(webData, statMap)
    if(!webHtml) return { content: 'Error getting html' }

    let webImg = await getImg(webHtml, obj.id, 1400, false)
    if(!webImg) return { content: 'Error getting image' }

    return { content: null, file: webImg, fileName: pObj.name+'-datacron'+'.png' }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
