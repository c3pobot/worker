'use strict'
const mongo = require('mongoclient')
const twReport = require('src/cmds/tw-guild/report')
const swgohClient = require('src/swgohClient')
const { getGuildId, checkGuildAdmin } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let allyCode = +(opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '') || 0)
  if(!allyCode) return { content: 'You must provide an allyCode for opponent guild' }
  let pObj = await getGuildId({ dId: obj.user.id }, {}, opt)
  if(!pObj.guildId) return { content: 'You do not have allycode linked to discordId' }

  let auth = await checkGuildAdmin(obj, opt, pObj)
  if(!auth) return { content: "This command is only avaliable to guild Admins" }

  let gObj = await getGuildId( {}, { allyCode: allyCode }, {})
  if(!gObj.guildId) return { content: `${allyCode} is not a valid allyCode` }

  if(pObj.guildId === gObj.guildId) return { content: `you can't set your own guild as your opponent` }

  await mongo.set('twStatus', { _id: pObj.guildId }, { enemy: gObj.guildId, joined: [] })
  return await twReport(obj, opt, true)
}
