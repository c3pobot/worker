'use strict'
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')

 module.exports = async(obj = {}, opt = {})=>{
   if(!botSettings?.botSID) return { content: 'Bot Server not defined' }

   if(!opt.vip?.value && !opt.guild?.value && !opt.shard?.value) return { content: 'you must provide a subscription role...' }
   let data = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { _id: 0, TTL: 0 }))[0]
   if(!data?.id) data = { id: botSettings.botSID.toString(), vip: [], guild: [], shard: [] }
   let msg2send = `Server subscriptions role(s):\n`
   if(opt.vip?.value){
     data.vipRole = opt.vip.value
     msg2send += `vip to **@${opt.vip?.data?.name}**\n`
   }
   if(opt.guild?.value){
     data.guildRole = opt.guild.value
     msg2send += `guild to **@${opt.guild?.data?.name}**\n`
   }
   if(opt.shard?.value){
     data.shardRole = opt.shard.value
     msg2send += `shard to **@${opt.shard?.data?.name}**\n`
   }

   await mongo.set('serverSubscriptions', { _id: botSettings.botSID.toString() }, data)
   return { content: msg2send }
 }
