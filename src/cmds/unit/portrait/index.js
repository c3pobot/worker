'use strict'
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { findUnit, getFakeUnit, getImg, joinImages } = require('src/helpers')
const { formatUnit } = require('src/format')
const getImage = require('./getImage')

const BOT_HELP_SERVER_ID = process.env.BOT_HELP_SERVER_ID
const BOT_OWNER_ID = process.env.BOT_OWNER_ID

module.exports = async(obj = {}, opt = {})=>{
  if(!BOT_HELP_SERVER_ID || BOT_HELP_SERVER_ID !== obj.guild_id) return { content: 'This command is only available from the bots discord help server' }
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let unit = opt.unit?.value?.toString()?.trim(), image_link = opt.image_link?.value?.trim()
  if(!unit) return { content: 'unit not provided' }
  if(!image_link) return { content: 'image link not provided' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: 'Error finding unit **'+unit+'**' }

  let rarity = +(opt.rarity?.value || 7), gType = opt.gear1?.value, gValue = opt.value1?.value, gLevel = 13, rLevel = botSettings.maxRelic || 11
  if(gType === 'g'){
    rLevel = 0
    if(gValue >= 0 && gValue < 13) gLevel = +gValue
  }
  if(gType === 'r' && gValue >= 0 && (+gValue + 2 < rLevel)) rLevel = +gValue + 2

  let webUnit = await getFakeUnit(uInfo, +gLevel, +rLevel, +rarity, true)
  if(webUnit) webUnit = await formatUnit(uInfo, webUnit)
  if(!webUnit) return { content: `Error getting stats for **${uInfo.nameKey}**` }

  let base64Img = await getImage(image_link)
  if(!base64Img) return { content: 'error getting image from provided link' }

  let webData1 = await getHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
  if(!webData1?.html) return { content: 'error getting old html' }

  let webImg1 = await getImg(webData1.html, obj.id, 758, false)
  if(!webImg1) return { content: 'error getting old image' }

  webUnit.image_link = `data:image/png;base64,${base64Img}`
  let webData2 = await getHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
  if(!webData2?.html) return { content: 'error getting new html' }

  let webImg2 = await getImg(webData2.html, obj.id, 758, false)
  if(!webImg2) return { content: 'error getting new image' }

  let webImg = await joinImages( [ webImg1, webImg2 ], { direction: 'horizontal', color: { alpha: 1.0, b: 0, g: 0, r: 0 } })
  let actionRow = [], votes = { type: 1, components : [] }, adminControl = { type: 1, components : [] }
  votes.components.push({
    type: 2,
    label: 'Yes (0)',
    style: 3,
    custom_id: JSON.stringify({ y: 0, n: 0, cmd: 'unit-vote', poll: obj.id, value: 'yes' })
  })
  votes.components.push({
    type: 2,
    label: 'No (0)',
    style: 4,
    custom_id: JSON.stringify({ y: 0, n: 0, cmd: 'unit-vote', poll: obj.id, value: 'no' })
  })
  adminControl.components.push({
    type: 2,
    label: 'Approve',
    style: 3,
    custom_id: JSON.stringify({ cmd: 'unit-approve', poll: obj.id, value: 'yes' })
  })
  adminControl.components.push({
    type: 2,
    label: 'Reject',
    style: 4,
    custom_id: JSON.stringify({ cmd: 'unit-approve', poll: obj.id, value: 'no' })
  })
  actionRow.push(votes)
  actionRow.push(adminControl)
  await mongo.set('unitPortraitPoll', { _id: obj.id }, { baseId: uInfo.baseId, thumbnailName: uInfo.thumbnailName, image_link: image_link, base64Img: base64Img, y: 0, n: 0, dId: obj?.member?.user?.id, status: true })
  return { content: `Vote for the new portrait (right) to replace the current (left)\n<${image_link}>`, file: webImg, fileName: 'unit-'+uInfo.baseId+'.png', components: actionRow || [] }
}
