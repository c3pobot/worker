'use strict'
const log = require('logger')
const ReplyMsg = require('./replyMsg')
module.exports = async(obj, allyCode)=>{
  try{
    log.error('Google Token Error for allyCode: '+allyCode)
    await ReplyMsg(obj, {content: 'Your google auth has been revoked or expired. Please re auth the bot using the `/allycode auth google` command'})
  }catch(e){
    log.error(e)
  }
}
