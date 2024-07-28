'use strict'
const log = require('logger')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, allyCode)=>{
  if(allyCode) log.error('Google Token Error for allyCode: '+allyCode)
  await replyMsg(obj, {content: 'Your google auth has been revoked or expired. Please re auth the bot using the `/allycode auth android` command'})
  return 'GETTING_CONFIRMATION'
}
