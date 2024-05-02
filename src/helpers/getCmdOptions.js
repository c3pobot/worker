'use strict'
const mongo = require('mongoclient')
module.exports = async(cmdId)=>{
  if(!cmdId) return
  let res = (await mongo.find('cmdOptCache', { _id: cmdId }))[0]
  mongo.del('cmdOptCache', { _id: cmdId })
  return res?.data
}
