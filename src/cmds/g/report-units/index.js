'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
const { getGuildId, checkGuildAdmin } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You allyCode is not linked to your discordId or you are not part of a guild...' }

  let auth = await checkGuildAdmin(obj, opt, pObj)
  if(!auth) return { content: "This command is only avaliable to guild Admins" }
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt, pObj, server)
  return msg2send
}
