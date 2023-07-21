'use strict'
const { mongo, ButtonPick, GetAllyCodeObj, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const GetPlatoonConfig = async(guildId, tbId)=>{
  try{
    const obj = (await mongo.find('tbPlatoonConfig', {_id: guildId}))[0]
    if(obj && obj[tbId]) return obj[tbId].data
  }catch(e){
    console.error(e);
  }
}
module.exports = async(obj ={}, opt = [])=>{
  try{
    let msg2send = {content: "You do not have allyCode linked to discord Id"}, pObj, round, pConfig, pCache
    let tbId = GetOptValue(opt, 'tb-name', 't05D')
    if(obj.confirm?.round){
      round = obj.confirm.round
      await ReplyButton(obj)
    }
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(dObj?.allyCode){
      msg2send.content = 'error getting player data'
      pObj = await swgohClient('queryPlayer', { allyCode: dObj.allyCode.toString()})
    }
    if(pObj?.guildId && tbId){
      msg2send.content = 'Your guild does not have any platoon info configured'
      let tempObj = (await mongo.find('tbPlatoonConfig', {_id: pObj.guildId}))[0]
      if(tempObj && tempObj[tbId]) pConfig = tempObj[tbId].data
    }
    if(pConfig?.length > 0 && !round){
      const embedMsg = {
        content: 'Please select the round for the platoons you want to see?',
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
    }
    if(pConfig?.length > 0 && round){
      msg2send.content = 'Your guild does not have the platoons cached for Round '+round+'. Run the `/tb platoons` command to cache the data'
      let tempCache = (await mongo.find('tbPlatoonCache', {_id: pObj?.guildId+'-'+tbId+'-'+round}))[0]
      if(tempCache?.platoons) pCache = tempCache.platoons
    }
    if(pCache){
      let count = 0
      const embedMsg = {
        color: 15844367,
        title: pObj.name+' platoons for Round '+round,
        description: ''
      }
      for(let i in pCache){
        if(!pCache[i].squads || pCache[i].squads?.length === 0) continue
        let tempStr, zoneTitle, squadStr, zoneCount = 0
        for(let s in pCache[i].squads){

          let units = pCache[i].squads[s].units?.filter(x=>x.allyCode === +pObj.allyCode)
          if(!units || units.length === 0) continue
          if(!zoneTitle) zoneTitle = pCache[i].id+' '+pCache[i].type+' '+pCache[i].nameKey
          if(!squadStr) squadStr = ''
          squadStr += 'Squad '+pCache[i].squads[s].num+'\n```\n'
          for(let u in units){
            ++count
            ++zoneCount
            squadStr += units[u].nameKey+'\n'
          }
          squadStr += '```\n'
        }
        if(zoneTitle) zoneTitle += ' ('+zoneCount+')\n'
        if(zoneTitle && squadStr) embedMsg.description += zoneTitle+''+squadStr
      }
      if(count === 0) embedMsg.description = 'You have no units for these platoons'
      embedMsg.title += ' ('+count+')'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e);
  }
}
