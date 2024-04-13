'use strict'
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, msg)=>{
  await replyMsg(obj, {content: msg ? msg:'Here we go again....', components:[]}, 'PATCH')
}
