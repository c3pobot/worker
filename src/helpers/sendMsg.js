'use strict'
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, content)=>{
  await replyMsg(obj, content, 'POST')
}
