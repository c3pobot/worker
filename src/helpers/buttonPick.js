'use strict'
const mongo = require('mongoclient')
const saveCmdOptions = require('./saveCmdOptions')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  await saveCmdOptions(obj)
  await replyMsg(obj, msg, method)
}
