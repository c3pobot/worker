'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const getHTML = require('./getHTML')
const { getDiscordAC, replyTokenError, getImg } = require('src/helpers')
const sorter = require('json-array-sorter')
const checkLoadout = (modId, tabName, modDef = {}, modLoadout = [], res = [])=>{
  for(let i in modLoadout){
    if(modLoadout[i]?.modId?.filter(x=>x === modId)?.length > 0) res.push({ id: modId, tab: tabName, name: modLoadout[i].name, modNameKey: modDef.nameKey, slot: modDef.slotNameKey })
  }
}
const checkLoadouts = (modId, modDef = {}, loadouts = [], res = [])=>{
  for(let i in loadouts) checkLoadout(modId, loadouts[i].name, modDef, loadouts[i].modLoadout, res)
}
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  let mods = pObj?.inventory?.unequippedMod || []
  if(!mods || mods?.length == 0) return { content: 'You have no un-equipped mods...' }


  let modDef = (await mongo.find('configMaps', {_id: 'modDefMap'} ))[0]?.data
  if(!modDef || modDef?.length === 0) return { content: 'Error getting mod definitions...' }

  let dObj = await getDiscordAC(obj.member.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return { msg2send: { content: 'You must have you android/ea_connect auth linked to your discordId' } }

  let loadouts = await swgohClient.oauth(obj, 'getModLoadouts', dObj, {})
  if(loadouts == 'GETTING_CONFIRMATION') return
  if(loadouts?.error){
    await replyTokenError(obj, dObj?.allyCode, loadouts.error)
    return
  }
  if(loadouts?.msg2send) return { content: loadouts.msg2send }

  loadouts = loadouts?.data?.modLoadoutTab
  if(!loadouts) return { content: 'error getting loadouts...' }
  if(loadouts?.length == 0) return { content: 'you don`t have any loadouts saved...' }

  let res = []
  for(let i in mods) checkLoadouts(mods[i].id, modDef[mods[i].definitionId], loadouts, res)
  if(res?.length == 0) return { content: 'you do not have any unequipped mods part of a loadout..' }

  res = sorter([{column: 'tab', order: 'ascending'}], res || [])

  let imgHTML = getHTML(pObj.player, res)
  if(!imgHTML) return { content: 'error getting html...' }

  let webImg = await getImg(imgHTML, obj.id, 640, false)
  if(!webImg) return { content: 'Error getting image...' }

  return { content: null, file: webImg, fileName: `${pObj.player?.name}-unequipped-mod-loadouts.png` }
}
