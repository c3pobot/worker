'use strict'
const { log, mongo, ButtonPick, GetGuildId, GetAllyCodeFromDiscordId, GetScreenShot, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const getHTML = require('getHTML/tb/platoons')
const BasicMap = require('./basicMap')
const SavedMap = require('./savedMap')
const GetPlatoonConfig = async(guildId, tbId)=>{
  try{
    let obj = (await mongo.find('tbPlatoonConfig', {_id: guildId}))[0]
    if(obj && obj[tbId]) return obj[tbId].data
  }catch(e){
    throw(e);
  }
}
const playerProjection = { name: 1, playerId: 1, allyCode: 1, guildName: 1, guildId: 1, roster:1, summary: 1 }
module.exports = async(obj ={}, opt = [])=>{
  try{
    let msg2send = { content: 'You must specify a phase or select a configured day' }, skipConfig, guildId, guild, guildName, dObj, units = {}, platoons = [], webData, webHTML, webImg, pConfig
    let round = GetOptValue(opt, 'round')
    let tbId = await GetOptValue(opt, 'tb-name', 't05D')
    if(obj.confirm?.round){
      if(obj.confirm.round !== 'none'){
        skipConfig = true
        round = obj.confirm.round
      }

      await ReplyButton(obj)
    }
    let pDef = (await mongo.find('tbPlatoonList', {_id: tbId}))[0]
    if(!pDef){
      await ReplyMsg(obj, { content: 'The platoon info is not in the database yet' })
      return
    }
    if(pDef?.platoons?.length > 0){
      msg2send.content = 'Your allyCode is not linked to discordId'
      dObj = await GetAllyCodeFromDiscordId(obj.member?.user?.id, opt)
    }
    if(dObj?.allyCode){
      msg2send.content = 'Error getting guildId'
      let gObj = await GetGuildId({}, dObj, [])
      if(gObj) guildId = gObj.guildId
    }
    if(guildId) pConfig = await GetPlatoonConfig(guildId, tbId)
    if(pConfig?.length > 0 && !round){
      const embedMsg = {
        content: 'You guild has platoon config saved do you want to use one of these?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in pConfig){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: 'Round-'+pConfig[i].round,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, round: +pConfig[i].round})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, round: 'none'})
      })
      await ButtonPick(obj, embedMsg)
      return
    }else{
      if(!round && guildId) msg2send.content = 'You must specify a phase or select a configured day'
    }
    if(round && round !== 'none' && guildId) webData = (await mongo.find('tbPlatoonCache', {_id: guildId+'-'+tbId+'-'+round}))[0]
    if(!webData && round && round !== 'none' && guildId){
      log.debug('Round '+round+' platoon not found in cache...')
      msg2send.content = 'error getting guildInfo'
      guild = await swgohClient('fetchGuild', { id: dObj.allyCode,  playerProject: playerProjection})
    }
    if(guild?.member?.length > 0){
      msg2send.content = 'Error Calculating data'
      let data
      if(pConfig?.length > 0){
        log.debug('tbPlatoonIds-'+round+'-'+tbId)
        data = SavedMap(guild.member, pDef.platoons, pConfig.find(x=>x.id === 'tbPlatoonIds-'+round+'-'+tbId)?.data, round)
        if(data?.platoons) mongo.set('tbPlatoonCache', {_id: guildId+'-'+tbId+'-'+round}, { platoons: data.platoons, nameKey: pDef.nameKey, guildName: guild.name, round: round } )
      }else{
        data = BasicMap(guild.member, pDef, opt)
      }
      if(data?.content) msg2send.content = data.content
      if(data?.platoons?.length > 0){
        webData = { platoons: data.platoons, nameKey: pDef.nameKey, guildName: guild.name }
      }
    }
    if(webData){
      msg2send.content = 'Error getting HTML'
      webHTML = await getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'Error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'platoons.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
