'use strict'
const { botSettings } = require('src/helpers/botSettings')
const mongo = require('mongoclient')
const rabbitmq = require('src/cmdQue/publisher')
const { AddGuildCmd } = require('src/helpers/discordmsg')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const addJob = async(sId, cmds = [])=>{
  await rabbitmq.add({ id: sId, guild_id: sId, member: { user: { id: BOT_OWNER_ID } }, data: { name: 'updateslashcmds', options: [{ name: 'update', value: 'add-guild-cmds'}] }, cmds: cmds })
}
module.exports = async(obj = {})=>{
  let slashCmds = await mongo.find('slashCmds', {})
  if(!slashCmds || slashCmds?.length == 0) return { content: 'There are no slashCmds saved in the database' }

  let cmdObj = { private: [], shard: [], 'home-guild': [], 'bo-private': [], 'bo-home': [] }
  for(let i in slashCmds){
    let tempCmds = slashCmds[i].cmds.filter(x=>x.type && !x.hidden && !x.type.includes('public'))
    if(!tempCmds || tempCmds?.length == 0) continue
    for(let c in tempCmds){
      if(!cmdObj[tempCmds[c].type]) cmdObj[tempCmds[c].type] = []
      if(cmdObj[tempCmds[c].type]) cmdObj[tempCmds[c].type].push(tempCmds[c].cmd)
    }
  }
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
    if(botSettings?.boSVR?.filter(x=>x == guilds[i]._id).length > 0){
      guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['bo-private'])))
      guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['bo-home'])))
    }
    if(!guildCmds || guildCmds?.length == 0) continue;
    /*
    if(guilds[i]._id === botSettings?.botSID){
      await AddGuildCmd(guilds[i]._id, guildCmds, 'PUT')
      gCount++;
      continue
    }
    */
    await addJob(guilds[i]._id, guildCmds)
    gDeferedCount++
  }
  for(let i in payouts){
    if(guilds.filter(x=>x._id == payouts[i].sId).length > 0) continue;
    let shardCmds = JSON.parse(JSON.stringify(cmdObj.shard)) || []
    /*
    if(payouts[i].sId === botSettings?.map?.botSID){
      await AddGuildCmd(payouts[i].sId, shardCmds, 'PUT')
      sCount++;
      continue
    }
    */
    await addJob(payouts[i].sId, shardCmds)
    sDeferedCount++
  }
  return { content: `Updated ${gCount} guild commands and ${sCount} shard commands. Deferred ${gDeferedCount} guild commands and ${sDeferedCount} shard command..`}
}
