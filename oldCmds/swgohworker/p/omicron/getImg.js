'use strict'
const GetOmiUnits = require('./getOmiUnits')
const GetHTML = require('webimg').omicron
const OmiFilter = require('./omiFilter')
const enumOmicron = require('./enum')
module.exports = async(pObj = {}, opt = [])=>{
  try{
    let res = {content: 'Error getting omi data from db'}, units, pUnits = [], omiFilter, webData, omicronImg
    let omiType = await HP.GetOptValue(opt, 'type', 0)
    if(omiType){
      omiFilter = (x=>x.omicronMode == omiType)
      if(OmiFilter[omiType]?.filter) omiFilter = OmiFilter[omiType]?.filter
    }
    let omiData = await mongo.find('omicronList', {})
    if(omiFilter){
      res.content = 'There are no **'+enumOmicron[omiType]+'** omicron(s) stored in the DB'
      omiData = omiData.filter(omiFilter)
    }
    if(omiData?.length > 0){
      res.content = 'Player has no units with '+(omiType ? '**'+enumOmicron[omiType]+'**':'')+' omicron(s)'
      const unitFilter = omiData.map(x=>x.unitBaseId)
      pUnits = pObj.rosterUnit.filter(x=> unitFilter.includes(x.definitionId.split(':')[0]))
    }
    if(pUnits?.length > 0){
      res.content = 'Error checking for omis'
      units = await GetOmiUnits(pUnits, omiData)
      if(units?.length == 0){
        msg2send.content = 'Player has no '+(omiType ? '**'+enumOmicron[omiType]+'**':'')+' omicron(s)'
      }
    }
    if(units?.length > 0){
      units = await sorter([{order: 'descending', column: 'count'}], units)
      res.content = 'Error getting HTML'
      webData = await GetHTML.player(units, {
        player: pObj.name,
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 50
      //if(webData.colLimit) windowWidth = (152 * +webData.colLimit)
      omicronImg = await HP.GetImg(webData.html, windowWidth, false)
    }
    if(omicronImg){
      res.content = null
      res.file = omicronImg
      res.fileName = 'omicron.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
