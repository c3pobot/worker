'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getReport = require('src/cmds/tw/report')
const { checkGuildAdmin, getDiscordAC, replyButton, getGuildId, replyTokenError, buttonPick, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: "This command is only avaliable to guild Admins"}
  if(obj.confirm?.enemyName && obj.confirm?.enemyId){
    await replyMsg(obj, { content: `Running tw report...\n${obj.confirm?.enemyName} swgoh.gg link\nhttps://swgoh.gg/g/${obj.confirm?.enemyId}/\n`, components: []} )
    let reporMsg = await getReport(obj, opt)
    return reportMsg
  }
  let auth = await checkGuildAdmin(obj, opt)
  if(!auth) return msg2send

  let allyCode = getOptValue(opt, 'allycode')?.toString()?.replace(/-/g, '')
  if(!allyCode) return { content: 'You must provide an allyCode for opponent guild' }

  let pObj = await getGuildId({ dId: obj.members?.user?.id})
  if(!pObj?.guildId) return { content: 'You do not have allycode linked to discordId' }

  let eObj = await swgohClient.post('queryPlayer', { allyCode: allyCode })
  if(!eObj?.guildId) return { content: `**${allyCode} is not a valid allyCode`}

  await mongo.set('twStatus', {_id: pObj?.guildId}, {enemy: eObj?.guildId, joined: []})
  msg2send.content = 'You can run the TW report with button below or using `/tw report` command\nNote: It can take a while to run during busy times'
  msg2send.components = [{ type:1, components: []}]
  msg2send.components[0].components.push({
      type: 2,
      label: 'Run TW report',
      style: 3,
      custom_id: JSON.stringify({enemyId: enemyId, qty: qty, enemyName: enemyName})
    })
  await replyMsg(obj, {content: `Successfully set ${enemyName} as your TW opponent. swgoh.gg link\nhttps://swgoh.gg/g/${enemyId}/`})
  await buttonPick(obj, msg2send, 'POST')
}
