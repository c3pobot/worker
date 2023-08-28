'use strict'
const mongo = require('mongoclient')
module.exports = async(disc = [], equipped = true)=>{
  try{
    let i = disc.length, discIds = disc.map(x=>x.definitionId), res = [], tempDisc = {}
    let discDef = await mongo.find('conquestDiscList', { _id: { $in: discIds} })
    while(i--){
      let tempObj = discDef?.find(x=>x._id === disc[i].definitionId)
      if(!tempObj) continue;
      if(equipped){
        res.push(tempObj)
        continue;
      }
      if(!tempDisc[disc[i].definitionId]){
        tempDisc[disc[i].definitionId] = tempObj
        tempDisc[disc[i].definitionId].count = 0
      }
      ++tempDisc[disc[i].definitionId].count
    }
    if(equipped) return res
    return Object.values(tempDisc)
  }catch(e){
    throw(e)
  }
}
