'use strict'
const log = require('logger')
const updateCmd = require('./cmds/updateslashcmds/cmd.json')
const mongo = require('mongoclient')
const { addGuildCmd, getGuildCmds } = require('./helpers/discordmsg')

module.exports = async()=>{
  let botSettings = (await mongo.find('botSettings', { _id: "1" }))[0]
  if(!botSettings?.botSID) return
  let commands = await getGuildCmds(botSettings.botSID)
  if(commands?.filter(x=>x.name == 'updateslashcmds').length == 0){
    log.info(`updateslashcmds cmd is missing. Adding now....`)
    let status = await addGuildCmd(botSettings.botSID, updateCmd?.cmd, 'POST')
    if(status?.id) log.info(`added updateslashcmds successfully to bot server...`)
  }
}
