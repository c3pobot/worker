'use strict'
const mongo = require('mongoclient')
module.exports = async(baseId)=>{
  let unit = (await mongo.find('units', {_id: baseId}))[0]
  return unit
}
