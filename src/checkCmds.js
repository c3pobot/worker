'use strict'
const path = require('path')
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const PRIVATE_BOT = process.env.PRIVATE_BOT
const { botSettings } = require('helpers/botSettings')
const SlashCmd = require('workerCmds/updateslashcmds/cmd.json')
const { DiscordQuery, log } = require('helpers')
const checkCmd = async()=>{
  try{
    if(!CLIENT_ID) throw('missing discord client id, cannot check for updateslashcmd cmd....')
    if(PRIVATE_BOT){
      let globalCmds = await DiscordQuery(path.join('applications', CLIENT_ID, 'commands'), 'GET')
      if(!globalCmds || globalCmds?.filter(x=>x.name === 'updateslashcmds').length === 0){
        log.error('update cmd missing adding it now ...')
        let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'commands'), 'POST', JSON.stringify(SlashCmd.cmd))
        if(status?.name === 'updateslashcmds'){
          log.info('added updateslashcmds successfully...')
        }else{
          log.error('error adding updateslashcmds...')
          log.error(JSON.stringify(status))
        }
      }
    }else{
      let guildCmds = await DiscordQuery(path.join('applications', CLIENT_ID, 'guilds', botSettings.map.botSID, 'commands'), 'GET')
      if(!guildCmds || guildCmds?.filter(x=>x.name === 'updateslashcmds').length === 0){
        log.error('update cmd missing adding it now ...')
        let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'guilds', botSettings.map.botSID, 'commands'), 'POST', JSON.stringify(SlashCmd.cmd))
        if(status?.name === 'updateslashcmds'){
          log.info('added updateslashcmds successfully...')
        }else{
          log.error('error adding updateslashcmds...')
          log.error(JSON.stringify(status))
        }
      }
    }
  }catch(e){
    log.error(e);
    setTimeout(checkCmd, 5000)
  }
}
const checkBotInfo = () =>{
  try{
    if(PRIVATE_BOT || botSettings.map.botSID){
      checkCmd()
    }else{
      setTimeout(checkBotInfo, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(checkBotInfo, 5000)
  }
}
checkBotInfo()
