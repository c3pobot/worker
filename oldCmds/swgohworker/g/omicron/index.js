'use strict'
const enumSkill = {
  b: 'Basic',
  l: 'Leader',
  s: 'Special',
  h: 'Reinforcement',
  u: 'Unique'
}
const GetHTML = require('webimg').omicron
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting data'}, allyCode, skillId, uInfo, gObj, skillInfo, skills, wData, imgHTML, omiImg
    if(obj?.confirm?.skillId){
      skillId = obj.confirm.skillId
      await HP.ReplyButton(obj, 'Getting omicron info ...')
    }
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    if(obj?.confirm?.unit) uInfo = (await mongo.find('units', {_id: obj.confirm.unit}))[0]
    if(unit && !uInfo){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, null)
    }
    if(uInfo && !skillId){
      const skills = Object.values(uInfo.skills)?.filter(x=>x.omiTier)
      if(skills?.length > 0){
        if(skills?.length === 1){
          skillId = skills[0].id
        }else{
          const pickMsg = { content: 'Please Choose skill below for **'+uInfo.nameKey+'**', components: [] }
          for(let i in skills){
            if(skills[i]?.omiTier){
              let skillLabel = skills[i]?.id?.charAt(0).toUpperCase()
              if(skillLabel == 'h') skillLabel = 'R'
              if(skills[i]?.id?.startsWith('ult')) skillLabel = 'Ult'
              skillLabel += ' - '+skills[i].nameKey
              if(pickMsg.components?.length == 0) pickMsg.components.push({ type:1, components: []})
              pickMsg.components[0].components.push({
                type: 2,
                label: skillLabel,
                style: 1,
                custom_id: JSON.stringify({id: obj.id, unit: uInfo.baseId, skillId: skills[i].id})
              })
            }
          }
          if(pickMsg?.components?.length > 0){
            await HP.ButtonPick(obj, pickMsg)
            return
          }else{
            msg2send.content = uInfo.nameKey+' does not have any omicron abilities'
          }
        }
      }else{
        msg2send.content = uInfo.nameKey+'  does not have any omicron ablilities'
      }
    }
    if(skillId && uInfo){
      skillInfo = uInfo.skills[skillId?.trim()]
    }
    if(skillInfo){
      msg2send.content = 'You do not have allyCode linked to discord'
      const allyObj = await HP.GetPlayerAC(obj, opt)
      if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
      if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    }

    if(allyCode){
      msg2send.content = 'Error getting player info'
      const pObj = await HP.GetGuildId({}, {allyCode: allyCode}, [])
      if(pObj?.guildId){
        msg2send.content = 'Error getting guild info'
        gObj = await HP.FetchGuild({token: obj.token, id: pObj.guildId, projection: { playerId: 1, name: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }}})
      }
    }
    if(gObj?.member?.length > 0){
      msg2send.content = 'Error Calculating data'
      let skillLabel = skillId?.charAt(0).toUpperCase()
      if(skillLabel == 'h') skillLabel = 'R'
      if(skillId?.startsWith('ult')) skillLabel = 'Ult'
      skillInfo.label = skillLabel
      let members = gObj.member.filter(r=>r.rosterUnit?.some(u=>u.definitionId.startsWith(uInfo.baseId+':'))).map(m=>{
        return Object.assign({}, {
          member: m.name,
          rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentRarity,
          gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).gp,
          gear: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentTier || 0),
          relic: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).relic?.currentTier - 2 || 0),
          skillTier: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))?.skill?.find(x=>x.id === skillId)?.tier || 0)
        })
      })
      wData = {
        have: (sorter([{column: 'gp', order: 'descending'}], members.filter(x=>x.skillTier + 2 >= skillInfo.omiTier)) || []),
        haveNot: (sorter([{column: 'gp', order: 'descending'}], members.filter(x=>x.skillTier + 2 < skillInfo.omiTier)) || []),
        guild: gObj.profile,
        uInfo: uInfo,
        skillInfo: skillInfo
      }
    }
    if(wData){
      msg2send.content = 'Error getting HTML'
      imgHTML = await GetHTML.guild(wData)
    }
    if(imgHTML){
      msg2send.content = 'Error getting Image'
      omiImg = await HP.GetImg(imgHTML, 600, false)
    }
    if(omiImg){
      msg2send.content = null
      msg2send.components = []
      msg2send.file = omiImg
      msg2send.fileName = gObj?.profile?.name+'-omicrons.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
