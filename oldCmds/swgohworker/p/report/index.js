'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let allyCode, pObj, msg2send = {content: 'You do not have allycode linked to discordId'}
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !allyObj.mentionError){
      msg2send.content = '**'+allyCode+'** is an invalid allyCode'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj && pObj.allyCode){
      msg2send.content = null
      msg2send.embeds = []
      const baseMsg = {
        color: 15844367,
        timestamp: new Date(pObj.updated),
        description: '[' + pObj.name + '](https://swgoh.gg/p/' + pObj.allyCode + '/gac-history/) profile (' + pObj.allyCode + ')',
        fields: [],
        footer: {
          text: "Data updated"
        }
      }
      baseMsg.fields.push(await FT.EmbedField('Overview', {
        'GP': numeral(pObj.gp).format('0,00'),
        'Guild': pObj.guildName,
        'level': pObj.level
      }, 13, '::'))
      baseMsg.fields.push(await FT.EmbedField('Mods', {
        'R6 Mods': pObj.sixModCount,
        'Mods +10': pObj.rosterUnit.reduce((acu, u) => {
          return acu + u.equippedStatMod.reduce((acm, m) => {
            return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 90000 && +ss.stat.statValueDecimal < 150000).length
          }, 0)
        }, 0),
        'Mods +15': pObj.rosterUnit.reduce((acu, u) => {
          return acu + u.equippedStatMod.reduce((acm, m) => {
            return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 140000 && ss.stat.statValueDecimal < 200000).length
          }, 0)
        }, 0),
        'Mods +20': pObj.rosterUnit.reduce((acu, u) => {
          return acu + u.equippedStatMod.reduce((acm, m) => {
            return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 190000 && ss.stat.statValueDecimal < 250000).length
          }, 0)
        }, 0),
        'Mods +25': pObj.rosterUnit.reduce((acu, u) => {
          return acu + u.equippedStatMod.reduce((acm, m) => {
            return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 240000).length
          }, 0)
        }, 0)
      }, 13 ,'::'))
      const relicObj = {
        name: 'Relics (' + pObj.rosterUnit.filter(r => r.relic && r.relic.currentTier > 2 && r.combatType == 1 && r.currentRarity >= 7).length + ')',
        value: '```autohotkey\n',
        inline: false
      }
      for (let i = 13; i > 6; i--) {
        const tempRelic = pObj.rosterUnit.filter(r => r.relic && r.relic.currentTier == +i && r.combatType == 1 && r.currentRarity >= 7).length
        if (+tempRelic > 0) relicObj.value += 'R' + (+i - 2) + '           :: ' + tempRelic + '\n';
      }
      relicObj.value += '```'
      baseMsg.fields.push(relicObj)
      baseMsg.fields.push(await FT.EmbedField('Quality', {
        'Mod Quality': numeral(pObj.quality.mods).format('0.00'),
        'Gear Quality': numeral(pObj.quality.gear).format('0.00'),
        'Total': numeral(pObj.quality.mods + pObj.quality.gear).format('0.00'),
        'Top 80 Mod Q': numeral(pObj.quality.top).format('0.00')
      }, 13, '::'))
      msg2send.embeds.push(baseMsg)
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
