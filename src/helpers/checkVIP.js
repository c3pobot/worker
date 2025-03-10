'use strict'
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')

module.exports = async(obj = {}, level = 1)=>{
  if(botSettings?.botSID){
    let subs = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { vip: 1 }))[0]
    if(subs?.vip?.includes(obj.member.user.id)) return 1
  }

  let vip = (await mongo.find('vip', {_id: obj.member.user.id}))[0]
  if(vip?.status && vip?.level >= level) return 1;
  return 0
}
