'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = [], discDef = {})=>{
  let res = []
  if(obj.length > 0){
    for(let i in obj){
      let tempObj = discDef[obj[i].definitionId]
      if(!tempObj){
        tempObj = (await mongo.find('dataDisc', {_id: obj[i].definitionId}))[0]
        if(tempObj) discDef[obj[i].definitionId] = tempObj
      }
      if(tempObj) res.push(tempObj)
    }
  }
  return res
}
