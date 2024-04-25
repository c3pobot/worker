'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getReport = require('src/cmds/tw/report')
const { getDiscordAC, replyButton, replyTokenError, buttonPick, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}
  if(obj.confirm?.enemyName && obj.confirm?.enemyId){
    await replyMsg(obj, { content: `Running tw report...\n${obj.confirm?.enemyName} swgoh.gg link\nhttps://swgoh.gg/g/${obj.confirm?.enemyId}/\n` } )
    let reportMsg = await getReport(obj, opt)
    await replyMsg(obj, reportMsg, 'POST')
    return
  }
  let loginConfirm = obj.confirm?.response
  if(obj.confirm) await replyButton(obj, 'Getting TW opponent....')

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId && !dObj.type) return msg2send

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild) return { content: 'Error getting guild data...'}
  if(!gObj?.data?.guild?.territoryWarStatus || gObj?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress' }

  let enemyId = gObj.data.guild.territoryWarStatus[0]?.awayGuild?.profile?.id, enemyName = gObj.data.guild.territoryWarStatus[0]?.awayGuild?.profile?.name
  if(!enemyId) return { content: 'Error determining opponent...'}

  let joined = gObj.data.guild.territoryWarStatus[0].optedInMember.map(m => {
    return Object.assign({}, {
      playerId: m.memberId,
      gp: m.power
    })
  })
  await mongo.set('twStatus', {_id: gObj.data.guild.profile.id}, {
    enemy: enemyId,
    joined: joined || []
  })
  msg2send.content = 'You can run the TW report with button below or using `/tw report` command\nNote: It can take a while to run during busy times'
  msg2send.components = [{ type:1, components: []}]
  msg2send.components[0].components.push({
      type: 2,
      label: 'Run TW report',
      style: 3,
      custom_id: JSON.stringify({id: obj.id, enemyId: enemyId, enemyName: enemyName})
    })
  await replyMsg(obj, {content: `Successfully set ${enemyName} as your TW opponent. swgoh.gg link\nhttps://swgoh.gg/g/${enemyId}/`})
  await buttonPick(obj, msg2send, 'POST')
}
