'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.discord = require('./discord')
Cmds.edit = require('./edit')
Cmds.find = require('./find')
Cmds.list = require('./list')
Cmds.import = require('./import')
Cmds.notify = require('./notify')
Cmds.remove = require('./remove')
Cmds.rotation = require('./rotation')
Cmds.status = require('./status')
Cmds.unwatch = require('./unwatch')
Cmds.watch = require('./watch')
module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opts)
  return msg2send
}
