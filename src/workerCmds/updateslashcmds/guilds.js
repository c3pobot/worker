'use strict'
const path = require('path')
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const PRIVATE_BOT = process.env.PRIVATE_BOT
const IS_TEST_BOT = process.env.IS_TEST_BOT
const { botSettings } = require('helpers/botSettings')
const { mongo, DiscordQuery, log, ReplyMsg } = require('helpers')
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: "Error getting SlashCmds from DB"}, cmdObj = {}, payload = {}
    if(!CLIENT_ID){
      ReplyMsg(obj, {content: 'Missing discord client id'})
      return
    }
    if(PRIVATE_BOT){
      ReplyMsg(obj, { content: "Only globalCmds for the private bot" })
      return
    }

    let slashCmds = await mongo.find('slashCmds', {})
    if(slashCmds.length == 0){
      ReplyMsg(obj, { content: 'There are no slashCmds saved in the database'})
      return
    }
    for(let i in slashCmds){
      let tempCmds = slashCmds[i].cmds.filter(x=>x.type && !x.hidden && !x.type.includes('public'))
      if(tempCmds?.length > 0){
        for(let c in tempCmds){
          if(!cmdObj[tempCmds[c].type]) cmdObj[tempCmds[c].type] = {type: tempCmds[c].type, cmds: []}
          cmdObj[tempCmds[c].type].cmds.push(tempCmds[c].cmd)
        }
      }
      if(process.env.IS_TEST_BOT){
        if(!cmdObj.public) cmdObj.public = {type: 'public', cmds: []}
        let publicCmds = slashCmds[i].cmds.filter(x=>x.type && x.type.includes('public')).map(c=>c.cmd)
        if(cmdObj?.public?.cmds && publicCmds?.length > 0) cmdObj.public.cmds = cmdObj.public.cmds.concat(publicCmds)
      }
    }
    let guilds = await mongo.find('discordServer', {basicStatus: 1}, {_id: 1, admin: 1})
    let payouts = await mongo.find('payoutServers', {status: 1}, {admin:1, patreonId:1, sId: 1})
    let gCount = 0, sCount = 0, gDeferedCount = 0, sDeferedCount = 0, gErrored = 0, sErrored = 0
    for(let i in guilds){
      let guildCmds = JSON.parse(JSON.stringify(cmdObj.private.cmds))
      if(process.env.IS_TEST_BOT && guilds[i]._id == botSettings?.map?.botSID) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj.public.cmds)))
      if(payouts?.filter(x=>x.sId == guilds[i]._id).length > 0) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj.shard.cmds)))
      if(botSettings?.map?.homeSVR?.filter(x=>x == guilds[i]._id).length > 0) guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['home-guild'].cmds)))
      if(botSettings?.map?.boSVR?.filter(x=>x == guilds[i]._id).length > 0){
        guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['bo-private'].cmds)))
        guildCmds = guildCmds.concat(JSON.parse(JSON.stringify(cmdObj['bo-home'].cmds)))
      }
      if(!guildCmds || guildCmds?.length === 0) continue;
      if(guilds[i]._id === botSettings?.map?.botSI){
        let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'guilds', guilds[i]._id, 'commands'), 'PUT', JSON.stringify(guildCmds))
        if(status?.length === guildCmds.length && status[0]?.guild_id === guilds[i]._id){
          ++gCount
        }else{
          ++gErrored
          log.error('error updating guild '+guilds[i]._id)
          log.error(JSON.stringify(status))
        }
      }else{
        await mongo.set('commandUpdates', {_id: guilds[i]._id}, { data: guildCmds, type: 'guild', dId: obj.member.user.id, chId: obj.channel_id, sId: obj.guild_id })
        ++gDeferedCount
      }
    }
    for(let i in payouts){
      if(guilds.filter(x=>x._id == payouts[i].sId).length > 0) continue;
      if(!cmdObj?.shard?.cmds || cmdObj?.shard?.cmds.length === 0) continue;
      if(payouts[i].sId === botSettings?.map?.botSID){
        let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'guilds', payouts[i].sId, 'commands'), 'PUT', JSON.stringify(cmdObj.shard.cmds))
        if(status?.length === cmdObj.shard.cmds.length && status[0]?.guild_id === payouts[i].sId){
          ++sCount
        }else{
          ++sErrored
          log.error('error updating guild '+payouts[i].sId)
          log.error(JSON.stringify(status))
        }
      }else{
        await mongo.set('commandUpdates', {_id: payouts[i].sId}, { data: cmdObj.shard.cmds, type: 'shard', dId: obj.member.user.id, chId: obj.channel_id, sId: obj.guild_id })
        ++sDeferedCount
      }
    }
    msg2send.content = 'Updated '+gCount+' guild commands and '+sCount+' shard commands. Deferred '+gDeferedCount+' guild commands and '+sDeferedCount+' shard commands...'
    if(gErrored) msg2send.content += '\n error adding commands to '+gErrored+' guilds...'
    if(sErrored) msg2send.content += '\n error adding commands to '+sErrored+' shards...'
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
