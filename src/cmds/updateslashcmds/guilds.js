'use strict'
const { botSettings } = require('src/helpers/botSettings')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')
const { addGuildCmd } = require('src/helpers/discordmsg')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const addJob = async(sId, cmds = [])=>{
  await rabbitmq.add('discord', { id: sId, guild_id: sId, member: { user: { id: BOT_OWNER_ID } }, data: { name: 'updateslashcmds', options: [{ name: 'update', value: 'add-guild-cmds'}] }, cmds: cmds })
}
const updateCmdObj = (cmds = [], obj = {})=>{
  if(!cmds || cmds.length == 0) return
  obj.private = obj.private.concat(cmds.filter(x=>x.type == 'private')?.map(x=>x.cmd) || [])
  obj.shard = obj.shard.concat(cmds.filter(x=>x.type == 'shard')?.map(x=>x.cmd) || [])
  obj['home-guild'] = obj['home-guild'].concat(cmds.filter(x=>x.type == 'home-guild')?.map(x=>x.cmd) || [])
  obj['bo'] = obj['bo'].concat(cmds.filter(x=>x.type == 'bo-private')?.map(x=>x.cmd) || [])
  obj['bo'] = obj['bo'].concat(cmds.filter(x=>x.type == 'bo-home')?.map(x=>x.cmd) || [])
}
module.exports = async(obj = {})=>{
  let slashCmds = await mongo.find('slashCmds', {})
  if(!slashCmds || slashCmds?.length == 0) return { content: 'There are no slashCmds saved in the database' }

  let cmdObj = { private: [], shard: [], 'home-guild': [], 'bo': [] }
  for(let i in slashCmds) updateCmdObj(slashCmds[i].cmds.filter(x=>x.type && !x.hidden && !x.type.includes('public')), cmdObj)
  let guilds = await mongo.find('discordServer', { basicStatus: 1 }, { _id: 1, admin:1, ignore: 1 })
  let payouts = await mongo.find('payoutServers', { status: 1 }, { admin: 1, patreonId: 1, sId: 1 })
  if(!guilds && !payouts) return { content: 'there are not servers set up for guild only commands' }
  if(guilds.length == 0 && payouts.length == 0) return { content: 'there are not servers set up for guild only commands' }

  let gCount = 0, sCount = 0, gDeferedCount = 0, sDeferedCount = 0
  for(let i in guilds){
    if(guilds[i].ignore) continue
    let guildCmds = JSON.parse(JSON.stringify(cmdObj?.private)) || []
    if(payouts?.filter(x=>x.sId == guilds[i]._id)?.length > 0) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj.shard)))
    if(botSettings?.homeSVR?.filter(x=>x == guilds[i]._id)?.length > 0) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['home-guild'])))
    if(botSettings?.boSVR?.filter(x=>x == guilds[i]._id).length > 0) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['bo'])))
    if(!guildCmds || guildCmds?.length == 0) continue;
    if(guilds[i]._id === botSettings?.botSID){
      await addGuildCmd(guilds[i]._id, guildCmds, 'PUT')
      gCount++;
      continue
    }
    await addJob(guilds[i]._id, guildCmds)
    gDeferedCount++
  }
  for(let i in payouts){
    if(guilds.filter(x=>x._id == payouts[i].sId).length > 0) continue;
    let shardCmds = JSON.parse(JSON.stringify(cmdObj.shard)) || []
    if(payouts[i].sId === botSettings?.map?.botSID){
      await addGuildCmd(payouts[i].sId, shardCmds, 'PUT')
      sCount++;
      continue
    }
    await addJob(payouts[i].sId, shardCmds)
    sDeferedCount++
  }
  return { content: `Updated ${gCount} guild commands and ${sCount} shard commands. Deferred ${gDeferedCount} guild commands and ${sDeferedCount} shard command..`}
}
