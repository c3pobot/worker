'use strict'
const getHTML = require('webimg').conquest
const getUnitStamina = require('./getUnitStamina')
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = [], pObj = {})=>{
  let staminaHtml, staminaImg, msg2send = {content: 'Error getting stamina info'}
  let res = {
    name: pObj.name,
    allyCode: pObj.allyCode,
    guild: pObj.guild,
    updated: pObj?.updated,
    units: []
  }
  res.units = getUnitStamina(pObj)
  if(res?.units){
    msg2send.content = 'error getting stamina HTML'
    staminaHtml = await getHTML.stamina(res)
  }
  if(staminaHtml){
    msg2send.content = 'error getting stamina image'
    staminaImg = await getImg(staminaHtml, obj.id, 400, false)
  }
  if(staminaImg){
    msg2send.content = null,
    msg2send.file = staminaImg
    msg2send.fileName = 'conquest-stamina.png'
  }
  return msg2send
}
