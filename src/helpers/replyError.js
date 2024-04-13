'use strict'
const log = require('logger')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {})=>{
  try{
    await replyMsg(obj, {content: 'Error occured'}, 'PATCH')
  }catch(e){
    log.error(e)
  }
}
