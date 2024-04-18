'use strict'
const log = require('logger')
const sorter = require('json-array-sorter')
const getOmiUnits = require('./getOmiUnits')
const getHTML = require('webimg').omicron
const omiFilter = require('./omiFilter')
const Enums = require('src/helpers/enum')
const { getOptValue, getImg  } = require('src/helpers')

module.exports = async(pObj = {}, opt = [])=>{
  try{
    let res = {content: 'Error getting omi data from db'}, units, pUnits = [], omiFilter, webData, omicronImg
    let omiType = getOptValue(opt, 'type', 0)
    if(omiType){
      omiFilter = (x=>x.omicronMode === omiType)
      if(OmiFilter[omiType]?.filter) omiFilter = OmiFilter[omiType]?.filter
    }
    let omiData = await mongo.find('omicronList', {})
    if(omiFilter){
      res.content = 'There are no **'+Enums?.omicron[omiType]+'** omicron(s) stored in the DB'
      omiData = omiData.filter(omiFilter)
    }
    if(omiData?.length > 0){
      res.content = 'Player has no units with '+(omiType ? '**'+enumOmicron[omiType]+'**':'')+' omicron(s)'
      let unitFilter = omiData.map(x=>x.unitBaseId)
      pUnits = pObj.rosterUnit.filter(x=> unitFilter.includes(x.definitionId.split(':')[0]))
    }
    if(pUnits?.length > 0){
      res.content = 'Error checking for omis'
      units = await getOmiUnits(pUnits, omiData)
      if(units?.length == 0){
        msg2send.content = 'Player has no '+(omiType ? '**'+enumOmicron[omiType]+'**':'')+' omicron(s)'
      }
    }
    if(units?.length > 0){
      units = sorter([{order: 'descending', column: 'count'}], units)
      res.content = 'Error getting HTML'
      webData = await getHTML?.player(units, {
        player: pObj.name,
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 50
      omicronImg = await getImg(webData.html, null, windowWidth, false)
    }
    if(omicronImg){
      res.content = null
      res.file = omicronImg
      res.fileName = 'omicron.png'
    }
    return res
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
