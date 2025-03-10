'use strict'
const checkAuth = require('./checkAuth')
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')
const { replyError } = require('src/helpers')
const Cmds = {}
Cmds.guild = require('./guild')
Cmds.notify = require('./notify')
Cmds.show = require('./show')
Cmds.user = require('./user')

const getPatreon = async(discordId)=>{
  if(!discordId) return
  let patreon = (await mongo.find('patreon', {_id: discordId }))[0]
  if(!patreon && botSettings?.botSID){
    let subs = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { guild: 1}))[0]
    if(!subs?.guild || subs?.guild?.length == 0) return
    if(subs.guild.includes(discordId)){
      patreon = { _id: discordId, maxAllyCodes: 200, status: 1, subscriber: true, users: [], guilds: [] }
      await mongo.set('patreon', { _id: discordId }, patreon)
    }
  }
  return patreon
}

module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let patreon = await getPatreon(obj.member?.user?.id)
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd === 'notify'){
      msg2send.content = 'This is only available to subscribers, patreons or those sponsored by a patreon'
      let auth = await checkAuth(obj.member.user.id)
      if(auth) msg2send = await Cmds.notify(obj, opt)
    }
    if(tempCmd && tempCmd !== 'notify' && Cmds[tempCmd]){
      msg2send.content = 'This is only avaliable to patreons and guild sync subscribers'
      if(patreon && !patreon.status) msg2send.content = 'Your patreon subscription expired'
      if(patreon?.status) msg2send = await Cmds[tempCmd](obj, patreon, opt)
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
