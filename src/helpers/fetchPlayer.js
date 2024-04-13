'use strict'
const swgohClient = require('src/swgohClient')
module.exports = async(obj)=>{
  return await swgohClient.post('fetchPlayer', obj, null)
}
