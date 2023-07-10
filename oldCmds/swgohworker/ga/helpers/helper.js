'use strict'
const got = require('got')
const QueryGACHistory = async(allyCode, instanceId)=>{
  try{
    if(debugMsg) console.log('Getting GAC History for '+allyCode+' '+instanceId)
    //console.log('Getting GAC History for '+allyCode+' '+instanceId)
    return await got('https://swgoh.gg/api/player/'+allyCode+'/gac/'+instanceId+'/', {
      method: 'GET',
      decompress: true,
      responseType: 'json',
      resolveBodyOnly: true
    })
  }catch(e){
    if(e.response && e.response.body){
      if(e.response.body.message){
        console.error(e.response.body.message)
      }else{
        e.response.body
      }
    }
  }
}
const Cmds = {}
Cmds.FormatUnit = async(unit)=>{
  try{
    const uInfo = (await mongo.find('units', {_id: unit.unit}, {thumbnail: 0, portrait: 0}))[0]
    if(uInfo){
      unit.combatType = uInfo.combatType
      unit.nameKey = uInfo.nameKey
      unit.thumbnail = uInfo.thumbnailName
      unit.gClass = (uInfo.combatType == 1 ? 'char-portrait-full-gear-t1':'')
      if(uInfo.combatType == 1){
        unit.gClass = 'char-portrait-full-gear-t'+unit.tier
        if(unit.relic > 2) unit.rClass = 'char-portrait-full-relic'
        if(unit.tier > 12) unit.gClass += ' char-portrait-full-alignment-'+(unit.definition.alignment == 'Light Side' ? 'light':'dark' )+'-side'
      }
      delete unit.definition
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.UpdateHistory = async(events = [], history = [], allyCode)=>{
  try{
    if(events.length > 0){
      for(let i in events){
        let saveNewData = 0, timeNow = +Date.now()
        let tempRound = history.find(x=>x.id == events[i].id)
        if(!tempRound) tempRound = {id: events[i].id, instance: [], allyCode: allyCode, mode: events[i].mode}
        if(events[i].instance && events[i].instance.length > 0){
          for(let e in events[i].instance){
            if((+Date.now() + 86400000) > +events[i].instance[e].endTime){
              let instanceId
              if(events[i].id && events[i].instance[e].id) instanceId = events[i].id+':'+events[i].instance[e].id
              if(instanceId){
                let tempObj = tempRound.instance.find(x=>x.instanceId == instanceId)
                if(!tempObj) tempObj = {
                  instanceId: instanceId,
                  mode: events[i].mode,
                  startTime: events[i].instance[e].startTime,
                  count: 0
                }
                if(tempObj.count > 9 && (!tempObj.lastTimeCheck || timeNow > +tempObj.lastTimeCheck + 86400000)) tempObj.count = 0
                if(tempObj.count < 11 && !tempObj.data){
                  saveNewData++
                  const newData = await QueryGACHistory(allyCode, instanceId)
                  if(newData){
                    tempObj.data = newData
                  }else{
                    tempObj.count++
                    tempObj.lastTimeCheck = +Date.now()
                  }
                  if(tempRound.instance.filter(x=>x.instanceId == instanceId).length > 0){
                    tempRound.instance.filter(x=>x.instanceId == instanceId)[0] = tempObj
                  }else{
                    tempRound.instance.push(tempObj)
                  }
                }
              }
            }
          }
        }
        if(saveNewData && tempRound.instance.length > 0){
          tempRound.instance = await sorter([{column: 'startTime', order: 'descending'}], tempRound.instance)
          await mongo.set('gacHist', {_id: allyCode+'-'+events[i].id}, tempRound)
          if(history.filter(x=>x.id == events[i].id).length > 0){
            history.filter(x=>x.id == events[i].id)[0] = tempRound
          }else{
            history.push(tempRound)
          }
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
module.exports = Cmds
