"use strict";
const log = require('logger')
const mongo = require('mongoclient')
const numeral = require('numeral')
const specUnits = require("./specUnits")
const summonStatCalc = require("./summonStatCalc")
const summonerList = []

const UpdateSummonerList = async()=>{
  try{
    let obj = await mongo.find('summonerList', {})
    let tempArray = []
    if(obj.length > 0){
      for(let i in obj) tempArray.push(obj[i].baseId);
      summonerList = tempArray
    }
  }catch(e){
    log.error(e)
  }
}
module.exports = async(unit)=>{
  try{
    if(summonerList.length == 0) await UpdateSummonerList()
    if(specUnits.base[unit.baseId]){
      if(unit.baseId == "YOUNGCHEWBACCA"){
        let health = (unit.stats.base[1] || 0) + (unit.stats.gear[1] || 0) + (unit.stats.mods[1] || 0)
        let prot = (unit.stats.base[28] || 0) + (unit.stats.gear[28] || 0) + (unit.stats.mods[28] || 0)
        return ({
          nameKey: "",
          info: [{
            nameKey:"ATP",
            value:numeral(( prot * 0.6 ) / ( ( health * 1.8 ) *0.1 )).format("0.00")
          }]
        })
      }
      if(unit.baseId === "BB8"){
        let speed = (unit.stats.base[5] || 0) + (unit.stats.gear[5] || 0) + (unit.stats.mods[5] || 0)
        let stats = []
        for(let i in specUnits.base[unit.baseId].statsList){
          stats.push({
            nameKey: i+" Droid Allies",
            value: Math.floor((1 / (1 - ((specUnits.base[unit.baseId].statsList[i] + 1) * 0.08))) * speed)
          })
        }
        return ({nameKey:specUnits.base[unit.baseId].nameKey, info:stats})
      }
      if(summonerList.filter(x=>x === unit.baseId).length > 0){
        let summonedStats = await summonStatCalc(unit)
        if(summonedStats.nameKey){
          return ({nameKey:summonedStats.nameKey,info:summonedStats.stats})
        }else{
          return ({info:[]})
        }
      }
    }else{
      return ({info:[]})
    }
  }catch(e){
    log.error(e)
    return ({info:[]})
  }
}
