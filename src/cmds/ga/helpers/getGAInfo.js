'use strict'
const mongo = require('mongoclient')
module.exports = async(allyCode)=>{
  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo) gaInfo = {units: [], enemies: []}
  if(!gaInfo.units) gaInfo.units = [];
  if(!gaInfo.enemies) gaInfo.enemies = [];
  return gaInfo
}
