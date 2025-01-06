'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, level = 1)=>{
  let auth = 0
  const vip = (await mongo.find('vip', {_id: obj.member.user.id}))[0]
  if(vip?.status && vip?.level >= level) auth++;
  return auth
}
