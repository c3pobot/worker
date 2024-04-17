'use strict'
const getHtml = require('webimg').tb
const getData = require('./getData')
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'You do not have google auth linked to your discordId' }
  let gObj = await getData(obj, opt)
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.content) msg2send.content = gObj.content
  if(!gObj?.data) return msg2send

  let webData = await getHtml.status(gObj.data)
  if(!webData) return { content: 'Error getting HTML' }

  let webImg = await getImg(webData, obj.id, 1800, false)
  if(!webImg) return { content: 'Error getting image' }

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'tbstatus.png'
  return msg2send
}
