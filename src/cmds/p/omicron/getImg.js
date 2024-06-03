'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getOmiUnits = require('./getOmiUnits')
const getHTML = require('webimg').omicron
const omiFilter = require('./omiFilter')
const Enums = require('src/helpers/enum')

const { getImg  } = require('src/helpers')

module.exports = async(pObj = {}, opt = {})=>{
  try{
    let omiType = +(opt.type?.value || 0), omiFilter
    if(omiType){
      omiFilter = (x=>x.omicronMode === omiType)
      if(omiFilter[omiType]?.filter) omiFilter = omiFilter[omiType]?.filter
    }
    let omiData = await mongo.find('omicronList', {})
    if(!omiData || omiData?.length == 0) return { content: 'error getting omicrons from db' }

    'There are no **'+Enums?.omicron[omiType]+'** omicron(s) stored in the db'
    if(omiFilter) omiData = omiData.filter(omiFilter)
    if(!omiData || omiData?.length == 0) return { content: 'There are no **'+Enums?.omicron[omiType]+'** omicron(s) stored in the db' }

    let unitFilter = omiData.map(x=>x.unitBaseId)
    let pUnits = pObj.rosterUnit.filter(x=> unitFilter.includes(x.definitionId.split(':')[0]))
    if(!pUnits || pUnits?.length == 0) return { content: 'Player has no units with '+(omiType ? '**'+Enums?.omicron[omiType]+'**':'')+' omicron(s)' }

    let units = await getOmiUnits(pUnits, omiData)
    if(!units) return { content: 'Error checking for omis' }
    if(units.length == 0) return { content: 'Player has no '+(omiType ? '**'+Enums?.omicro[omiType]+'**':'')+' omicron(s)' }

    units = sorter([{order: 'descending', column: 'count'}], units)
    let webData = await getHTML?.player(units, {
      player: pObj.name,
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    })
    if(!webData?.html) return { content: 'error getting html' }

    let webImg = await getImg(webData.html, null, 50, false)
    if(!webImg) return { content: 'error getting image' }

    return { content: null, file: webImg, fileName: 'omicron.png' }
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
