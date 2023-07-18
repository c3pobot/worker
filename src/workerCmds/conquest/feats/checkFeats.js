'use strict'
const { mongo, DeepCopy } = require('helpers')
const sorter = require('json-array-sorter')
const getFeatType = (id, type = 1)=>{
  let name
  if(id.includes('S0')) name = 1
  if(id.includes('S1')) name = (type ? 1:2)
  if(id.includes('S2')) name = (type ? 2:3)
  if(id.includes('S3')) name = (type ? 3:4)
  if(id.includes('S4')) name = (type ? 4:5)
  if(id.includes('S5')) name = 5
  if(!name) name = 10
  return name
}
module.exports = async(featChallenges = [], type = 1)=>{
  try{
    let featChallengesIds = featChallenges.map(x=>x.id)
    let feats = await mongo.find('conquestFeatList', {_id: {$in: featChallengesIds}})
    if(!feats || feats?.length === 0) return
    let i = feats.length, res = { complete: 0, incomplete: 0, missing: [] }
    while(i--){
      let tempFeat = featChallenges.find(x=>x.id == feats[i].id)
      if(feats[i]?.reward && tempFeat){
        if(tempFeat.claimed){
          res.complete += +feats[i].reward
        }else{
          res.incomplete += +feats[i].reward
          let tempObj = DeepCopy(feats[i])
          tempObj.currentValue = tempFeat.currentValue
          tempObj.completeValue = tempFeat.completeValue
          tempObj.sector = getFeatType(tempObj.id, type)
          res.missing.push(tempObj)
        }
      }
    }
    if(res.missing.length > 0) res.missing = sorter([{column: 'sector', order: 'ascending'}], res.missing)
    return res
  }catch(e){
    throw(e)
  }
}
