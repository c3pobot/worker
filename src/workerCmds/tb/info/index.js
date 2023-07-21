'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
const numeral = require('numeral')
const GetPhase = (zoneId)=>{
  try{
    if(zoneId.includes('_phase01_')) return 'P1'
    if(zoneId.includes('_phase02_')) return 'P2'
    if(zoneId.includes('_phase03_')) return 'P3'
    if(zoneId.includes('_phase04_')) return 'P4'
    if(zoneId.includes('_phase05_')) return 'P5'
    if(zoneId.includes('_phase06_')) return 'P6'
  }catch(e){
    console.error(e);
  }
}
const GetConflict = (zoneId)=>{
  try{
    if(zoneId.includes('_conflict01')) return 'C1'
    if(zoneId.includes('_conflict02')) return 'C2'
    if(zoneId.includes('_conflict03')) return 'C3'
    if(zoneId.includes('_conflict04')) return 'C4'
    if(zoneId.includes('_conflict05')) return 'C5'
    if(zoneId.includes('_conflict06')) return 'C6'
  }catch(e){
    console.error(e);
  }
}
const enumCombatType = {
  3: 'Char/Ship',
  1: 'Char',
  2: 'Ship'
}
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = { content: 'Error running command' }, tbDef
    let tbId = await GetOptValue(opt, 'tb-name', 't05D')
    if(tbId){
      msg2send.content = 'Error getting tb definition for '+tbId
      tbDef = (await mongo.find('tbList', {_id: tbId}))[0]
    }
    if(tbDef){
      let embedMsg = {
        title: tbDef.nameKey+' phase information',
        fields: []
      }
      for(let i in tbDef.conflictZoneDefinition){
        let tempObj = {
          name: GetPhase(tbDef.conflictZoneDefinition[i]?.zoneId)+' '+GetConflict(tbDef.conflictZoneDefinition[i]?.zoneId)+' '+enumCombatType[tbDef.conflictZoneDefinition[i].unitType],
          value: '```\n'
        }
        for(let p in tbDef.conflictZoneDefinition[i].victoryPointRewards){
          tempObj.value += (+p + 1)+'* '+numeral(tbDef.conflictZoneDefinition[i].victoryPointRewards[p].score).format('0,0')+'\n'
        }
        tempObj.value += '```'
        embedMsg.fields.push(tempObj)
      }
      msg2send.embeds = [embedMsg]
      msg2send.content = null
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
