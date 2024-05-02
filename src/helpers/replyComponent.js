'use strict'
const mongo = require('mongo')
const replyMsg = require('./replyMsg')
const saveCmdOptions = require('./saveCmdOptions')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  await saveCmdOptions(obj)
  await replyMsg(obj, content, method)
}
