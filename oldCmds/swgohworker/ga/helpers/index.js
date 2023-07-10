'use strict'
const moment = require('moment')
const {FormatUnit, UpdateHistory} = require('./helper')
const Cmds = {}
Cmds.GetGAHist = async(obj = {}, allyCode, mode = 'all')=>{
  try{
    let gacEvents = [], pHist = [], gaData = [], match, components, gaDataKey, queryNewData = 1, msg2send = 'Could not find any GAC instance id\'s stored'+(mode != 'all' ? ' for '+mode+' mode':''), webObj
    if(obj.select && obj.select.data && obj.select.data.length > 0){
      await HP.ReplyButton(obj, 'Getting GAC Data...')
      queryNewData = 0
      gaDataKey = obj.select.data[0]
    }
    const tempEvents = await mongo.find('gacEvents', {}, {id: 1, instance: 1, mode: 1})
    if(tempEvents && tempEvents.length > 0) gacEvents = tempEvents
    if(gacEvents.length > 0){
      const tempHist = await mongo.find('gacHist', {allyCode: allyCode})
      if(tempHist && tempHist.length > 0) pHist = tempHist
      if(queryNewData) await UpdateHistory(gacEvents, pHist, allyCode)
      if(mode != 'all' && pHist?.length > 0) pHist = pHist.filter(x=>x.mode == mode)
      if(pHist?.length > 0) pHist = pHist.reverse()
      if(pHist?.length > 24) pHist.splice(24)
    }
    if(pHist.length > 0){
      msg2send = 'There is no battle data GAC'
      gaData = await pHist.flatMap((p, seasonIndex)=>{
        return p.instance.filter(x=>x.data).flatMap((i, roundIndex)=>{
          return i.data.reverse().map((d, matchIndex)=>{
            const tempObj = Object.assign({}, d)
            tempObj.seasonId = p.id
            tempObj.startTime = i.startTime
            tempObj.mode = p.mode
            tempObj.seasonIndex = seasonIndex
            tempObj.roundIndex = roundIndex
            tempObj.matchIndex = matchIndex
            tempObj.matchNumber = +i.data.length - +matchIndex
            tempObj.key = seasonIndex+'-'+roundIndex+'-'+matchIndex
            return tempObj
          })
        })
      })
      if(gaData?.length > 0 && !gaDataKey) gaDataKey = gaData[0]?.key
      if(gaData?.length > 10) gaData.splice(10)
    }
    if(gaDataKey && gaData.length > 0){
      msg2send = 'Could not find ga data for the requested battle'
      match = gaData.find(x=>x.key === gaDataKey)
    }
    if(match){
      msg2send = 'There is no battle data for this round'
      if(gaData.length > 1){
        const compOpt = gaData.map(x=>{
          return Object.assign({}, {
            label: moment.utc(+x.startTime).format('MM/DD')+' Round '+x.matchNumber+(x.mode ? ' ('+x.mode+')':''),
            value: x.key,
            description: HP.TruncateString(x.player_name, 10)+' ('+x.player_score+')'+' vs '+HP.TruncateString(x.opponent_name, 10)+' ('+x.opponent_score+')',
            default: (x.key == gaDataKey ? true:false)
          })
        })
        if(compOpt.length > 0) components = [{type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id}), options: compOpt}]}]
      }
    }
    return {match: match, components: components, content: msg2send}
  }catch(e){
    console.log(e)
  }
}
Cmds.GetGAInfo = async(allyCode)=>{
  try{
    let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
    if(!gaInfo) gaInfo = {units: [], enemies: []}
    if(!gaInfo.units) gaInfo.units = [];
    if(!gaInfo.enemies) gaInfo.enemies = [];
    return gaInfo
  }catch(e){
    console.log(e)
  }
}
module.exports = Cmds
