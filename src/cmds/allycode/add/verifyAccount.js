'use strict'
const mongo = require('mongoclient')
const addAllyCode = require('./addAllyCode')
const assetUrl = process.env.SWGOHGG_IMG_URL
const getRandomNum = (array = []) =>{
  if(array.length == 1) return 0
  return Math.floor(Math.random()*array.length)
}
const getNewPortrait = (array = [], current)=>{
  if(!current && array.length > 0) return array[getRandomNum(array)]?.id
  array = array.filter(x=>x !== current)
  if(array.length > 0) return array[getRandomNum(array)]?.id
  if(current) return 'PLAYERPORTRAIT_DEFAULT'
}
const checkPortrait = (newPortrait, current)=>{
  if(newPortrait === 'PLAYERPORTRAIT_DEFAULT' && !current) return true
  if(newPortrait === current) return true
}
module.exports = async(obj = {}, opt = {}, pObj)=>{
  if(!pObj) return { content: 'error getting player data' }
  let verify = (await mongo.find('allyCodeVerificationCache', { _id: pObj.playerId }))[0]
  if(verify?.dId === obj.member?.user?.id && verify?.playerPortrait){
    let status = checkPortrait(verify.playerPortrait, pObj.selectedPlayerPortrait?.id)
    if(status) return await addAllyCode(obj, opt, pObj)
  }

  let newPortrait = getNewPortrait(pObj.unlockedPlayerPortrait, pObj.selectedPlayerPortrait?.id)
  if(!newPortrait) return { content: 'Error finding a playerPortrait for verification' }

  let data = (await mongo.find('playerPortraitList', { _id: newPortrait }))[0]
  if(!data?.icon) return { content: `error getting info for ${newPortrait} for verification` }
  let embedMsg = {
    color: 15844367,
    description: `allyCode **${pObj.allyCode}** for player **${pObj.name}** is already linked to another discordId\n`
  }
  if(assetUrl) embedMsg.thumbnail = { url: `${assetUrl}/${data.icon}.png` }
  embedMsg.description += `You can verify you have access to this account by setting you profile portrait to **${data.nameKey}**`
  if(assetUrl) embedMsg.description += ' (shown in this message)'
  embedMsg.description += ' and running the command again.\n'
  embedMsg.description += 'Note: This verification will expire in ~10 minutes'
  await mongo.set('allyCodeVerificationCache', { _id: pObj.playerId }, { dId: obj.member?.user?.id, allyCode: pObj.allyCode, playerPortrait: newPortrait })
  return { content: null, embeds: [embedMsg] }
}
