'use strict'
const log = require('logger')
const replyMsg = require('./replyMsg')
const sendBotMsg = require('./sendBotMsg')
/*
module.exports = async(obj = {})=>{
  await replyMsg(obj, { content: 'Error occured' }, 'PATCH')
}
*/
module.exports = async(obj = {})=>{
  await sendBotMsg(obj, { content: 'Error occured' }, 'PATCH')
}
