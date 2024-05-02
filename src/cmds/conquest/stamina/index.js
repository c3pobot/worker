'use strict'
const getHTML = require('webimg').conquest
const getUnitStamina = require('./getUnitStamina')
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  let res = {
    name: pObj.name,
    allyCode: pObj.allyCode,
    guild: pObj.guild,
    updated: pObj?.updated,
    units: []
  }
  res.units = getUnitStamina(pObj)
  if(res?.units?.length == 0 ) return { content: 'all units are at full stamina' }

  let webData = await getHTML.stamina(res)
  if(!webData) return { content: 'error getting html...' }

  let webImg = await getImg(webData, obj.id, 400, false)
  if(!webImg) return { content: 'error geting image...' }

  return { content: null, file: webImg, fileName: 'conquest-stamina.png' }
}
