'use strict'
const redis = require('redisclient')
const replyMsg = require('./replyMsg')
module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  await redis.setTTL('button-'+obj.id, obj, 600)
  await replyMsg(obj, msg, method)
}
