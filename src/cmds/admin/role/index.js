'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')

const { checkServerAdmin } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command requires bot server admin role' }

  let tempCmd, opts = []
  for(let i in opt){
    if(Cmds[opt[i].name]){
      tempCmd = opt[i].name
      if(opt[i].options) opts = opt[i].options
      break
    }
  }
  let msg2send = { content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided') }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opts)
  return msg2send
}
