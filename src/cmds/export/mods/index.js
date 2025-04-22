'use strict'
const { getDiscordAC } = require('src/helpers')

const getEquippedModsOnly = require('./getEquippedModsOnly')
const getAllMods = require('./getAllMods')
module.exports = async(obj = {}, opt = {})=>{
  
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

  let equippedOnly = opt.equipped_only?.value
  let dObj = await getDiscordAC(obj.member.user?.id, opt)
  if(!dObj?.allyCode) return { content: 'Your allyCode is not linked to your discordId' }
  if(!equippedOnly && (!dObj?.uId || !dObj?.type)) return { content: 'You must have you android/ea_connect auth linked to your discordId' }

  if(!equippedOnly && dObj?.uId && dObj?.type) return await getAllMods(obj, opt, dObj)
  return await getEquippedModsOnly(obj, opt, dObj)
}
