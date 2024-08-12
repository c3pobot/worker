'use strict'
const log = require('logger')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, allyCode)=>{
  if(allyCode) log.error('Google/EA_Connect Token Error for allyCode: '+allyCode)
  await replyMsg(obj, {content: 'Your google/ea_connect auth has been revoked or expired. Please re auth the bot using the `/allycode auth android` or `/allycode auth ea_connect` command'})
  return 'GETTING_CONFIRMATION'
}
