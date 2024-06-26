'use strict'
const checkAuth = require('./checkAuth')
const mongo = require('mongoclient')
const { replyError } = require('src/helpers')
const Cmds = {}
Cmds.guild = require('./guild')
Cmds.notify = require('./notify')
Cmds.show = require('./show')
Cmds.user = require('./user')

module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let patreon = (await mongo.find('patreon', {_id: obj.member?.user?.id, status: 1 }))[0]
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd === 'notify'){
      msg2send.content = 'This is only available to patreons or those sponsored by a patreon'
      let auth = await checkAuth(obj.member.user.id)
      if(auth) msg2send = await Cmds.notify(obj, opt)
    }
    if(tempCmd && tempCmd !== 'notify' && Cmds[tempCmd]){
      msg2send.content = 'This is only avaliable to patreons'
      if(patreon) msg2send = await Cmds[tempCmd](obj, patreon, opt)
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
