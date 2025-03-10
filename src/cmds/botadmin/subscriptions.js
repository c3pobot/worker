'use strict'
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')

 module.exports = async(obj = {}, opt = {})=>{
   if(!botSettings?.botSID) return { content: 'Bot Server not defined' }

   //if(!opt.vip?.value && !opt.guild?.value && !opt.shard?.value) return { content: 'you must provide a subscription role...' }
   let data = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { _id: 0, TTL: 0 }))[0]
   if(!data?.id) data = { id: botSettings.botSID.toString(), vip: [], guild: [], shard: [] }
   let msg2send = `Server subscriptions role(s):\n`
   if(opt.vip?.value){
     data.vipRole = opt.vip.value
     data.vipRoleName = opt.vip?.data?.name
   }
   if(opt.guild?.value){
     data.guildRole = opt.guild.value
     data.guildRoleName = opt.guild?.data?.name
   }
   if(opt.shard?.value){
     data.shardRole = opt.shard.value
     data.shardRoleName = opt.shard?.data?.name
   }
   if(data.vipRoleName) msg2send += `vip to **@${data.vipRoleName}**\n`
   if(data.guildRoleName) msg2send += `guild to **@${data.guildRoleName}**\n`
   if(data.shardRoleName) msg2send += `shard to **@${data.shardRoleName}**\n`
   await mongo.set('serverSubscriptions', { _id: botSettings.botSID.toString() }, data)
   return { content: msg2send }
 }
