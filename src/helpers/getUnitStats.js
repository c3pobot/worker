'use strict'
const got = require('got')
module.exports = async(baseId, type, values, flags)=>{
  if(baseId){
    let reqFlags = flags, reqPath = type+'/'+baseId.toUpperCase()+'?flags='
    if(!reqFlags) reqFlags = 'statIDs,calcGP,percentVals,gameStyle'
    reqPath += reqFlags
    if(values) reqPath += '&useValues='+JSON.stringify(values)
    return await got(process.env.STAT_URI+'/api/'+reqPath, {
      method: 'GET',
      decompress: true,
      retry: 0,
      timeout: 10000,
      responseType: 'json',
      resolveBodyOnly: true
    })
  }
}
