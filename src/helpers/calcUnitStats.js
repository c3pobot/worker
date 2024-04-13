'use strict'
const got = require('got')
const calcFinalStats = require('./calcFinalStats')
module.exports = async(body)=>{
  try{
    if(process.env.STAT_URI){
      let obj = await got(process.env.STAT_URI+'/api?flags=percentVals,calcGP,statIDs,gameStyle', {
        method: 'POST',
        json: body,
        retry: 0,
        timeout: 10000,
        decompress: true,
        responseType: 'json',
        resolveBodyOnly: true
      })
      if(obj?.length > 0){
        for(let i in obj){
          if(obj[i].stats) calcFinalStats(obj[i].stats)
        }
        return obj
      }
    }
  }catch(e){
    throw(e)
  }
}
