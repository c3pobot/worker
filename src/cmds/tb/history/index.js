'use strict'
const Cmds = {}
Cmds.update = require('./update')
Cmds.show = require('./show')

const { getGuildId, checkGuildAdmin } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  return { content: 'coming soon (tm)'}
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You allyCode is not linked to your discordId or you are not part of a guild...' }

  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt, pObj)
  return msg2send
}
