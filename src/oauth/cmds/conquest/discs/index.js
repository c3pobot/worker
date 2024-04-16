'use strict'
const getHTML = require('webimg').conquest
const formatEquppiedDiscs = require('./formatEquppiedDiscs')
const formatUnequippedDiscs = require('./formatUnequippedDiscs')
const { getOptValue, getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = [], pObj = {})=>{
  let discDef = {}, discImg, discHtml, msg2send = {content: 'Error getting disc info'}
  let discOpt = getOptValue(opt, 'option', 1)
  let res = {
    name: pObj.name,
    allyCode: pObj.allyCode,
    guild: pObj.guild,
    updated: pObj?.updated
  }
  if(discOpt == 1 || discOpt == 2) res.equippedDisc = await formatEquppiedDiscs(pObj.conquestStatus.equippedArtifact, discDef)
  if(discOpt == 1 || discOpt == 3) res.unequppedDisc = await formatUnequippedDiscs(pObj.conquestStatus.unequippedArtifact, discDef)
  if(res?.equippedDisc || res.unequppedDisc){
    msg2send.content = 'Error getting disc HTML'
    discHtml = await getHTML.disc(res)
  }
  if(discHtml){
    msg2send.content = 'Error getting disc image'
    discImg = await getImg(discHtml, obj.id, 640, false)
  }
  if(discImg){
    msg2send.content = null
    msg2send.file = discImg
    msg2send.fileName = 'conquest-disc.png'
  }
  return msg2send
}
