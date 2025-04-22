'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const { replyTokenError } = require('src/helpers')
const getMods = require('./getMods')
module.exports = async(obj = {}, opt = {}, dObj = {})=>{
  let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {})
  if(pObj === 'GETTING_CONFIRMATION') return
  if(pObj?.error){
    await replyTokenError(obj, dObj?.allyCode, pObj.error)
    return
  }
  if(!pObj?.data) return { content: 'You must have you android/ea_connect auth linked to your discordId' }

  let mods = []
  let units = pObj.data.inventory?.unit?.map(x=>{
    return { baseId: x.definitionId?.split(':')[0], equippedStatMod: x.equippedStatMod }
  })
  let unequippedMods = getMods.unequipped(pObj.data.inventory?.unequippedMod)
  let equippedMods = getMods.equipped(units)
  if(equippedMods?.length > 0) mods = mods.concat(equippedMods)
  if(unequippedMods?.length > 0) mods = mods.concat(unequippedMods)

  if(mods?.length == 0) return { content: 'Error getting mods' }

  let data = Buffer.from(JSON.stringify({ name: pObj?.data?.player.name, allyCode: +pObj?.data?.player?.allyCode, mods: mods }))
  return { content: 'All Mod inventory attached', flags: 64, file: data, fileName: `${pObj?.data?.player?.allyCode}-all-mods.json` }
}
