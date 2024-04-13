'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
const { getOptValue, checkGuildAdmin } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let tempCmd = getOptValue(opt, 'option')
  if(!tempCmd || !Cmds[tempCmd]) return {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return {content: "This command is only avaliable to guild Admins"}
  return await await Cmds[tempCmd](obj, opt)
}
