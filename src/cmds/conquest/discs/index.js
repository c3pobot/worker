'use strict'
const getHTML = require('webimg').conquest
const formatEquppiedDiscs = require('./formatEquppiedDiscs')
const formatUnequippedDiscs = require('./formatUnequippedDiscs')
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, pObj = {})=>{

  let discDef = {}, discOpt = opt.option?.value || 1, res = { name: pObj.name, allyCode: pObj.allyCode, guild: pObj.guild, updated: pObj?.updated }
  if(discOpt == 1 || discOpt == 2) res.equippedDisc = await formatEquppiedDiscs(pObj.conquestStatus.equippedArtifact, discDef)
  if(discOpt == 1 || discOpt == 3) res.unequppedDisc = await formatUnequippedDiscs(pObj.conquestStatus.unequippedArtifact, discDef)
  if(!res.equippedDisc && !res.unequppedDisc) return { content: 'Error getting disc info' }

  let webData = await getHTML.disc(res)
  if(!webData) return { content: 'Error getting html...' }

  let webImg = await getImg(webData, obj.id, 640, false)
  if(!webImg) return { content: 'Error getting disc image' }

  return { content: null, file: webImg, fileName: 'conquest-disc.png' }
}
