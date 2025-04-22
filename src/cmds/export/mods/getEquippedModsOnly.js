'use strict'
const swgohClient = require('src/swgohClient')

const getMods = require('./getMods')
module.exports = async(obj = {}, opt = {}, dObj = {})=>{
  let pObj = await swgohClient.post('fetchPlayer', { allyCode: dObj?.allyCode.toString() })
  if(!pObj?.rosterUnit) return { content: 'error getting player data' }

  let mods = getMods.equipped(pObj.rosterUnit)
  if(mods?.length == 0) return { content: 'Error getting mods' }

  let data = Buffer.from(JSON.stringify({ name: pObj?.name, allyCode: +pObj?.allyCode, mods: mods }))
  return { content: 'Equipped Mod inventory attached', flags: 64, file: data, fileName: `${pObj?.allyCode}-unequipped-mods.json` }
}
