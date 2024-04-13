'use strict'
const formatPlayerStat = require('./formatPlayerStat')
const sorter = require('json-array-sorter')
module.exports = = async(roster = [], statInfo = {}, sort = 'mod')=>{
  let res = []
  for(let i in roster){
    if(roster[i]?.stats){
      const tempObj = await formatPlayerStat(roster[i], statInfo, sort)
      if(tempObj) res.push(tempObj)
    }
  }
  if(res?.length > 0) res = sorter([{ column: 'sort', order: 'descending' }], res)
  return res
}
