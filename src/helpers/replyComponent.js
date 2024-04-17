'use strict'
const redis = require('redisclient')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  await redis.setTTL('component-'+obj.id, obj, 600)
  await replyMsg(obj, content, method)
}
