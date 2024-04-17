'use strict'
const mongo = require('mongoclient')
module.exports = async(guildId, tbId)=>{
  let obj = (await mongo.find('tbPlatoonConfig', {_id: guildId}))[0]
  if(obj && obj[tbId]) return obj[tbId].data
}
