'use strict'
module.exports = (obj = {}, dId)=>{
  let res = obj.data?.resolved?.members[dId]?.nick
  if(!res) res = obj.data?.resolved?.users[dId]?.username
  return res
}
