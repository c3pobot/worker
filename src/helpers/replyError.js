'use strict'
const log = require('logger')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {})=>{
  await replyMsg(obj, {content: 'Error occured'}, 'PATCH')
}
