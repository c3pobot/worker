'use strict'
//let DataCronDefMap = {}
const { configMaps } = require('helpers/configMaps')
const numeral = require('numeral')
const swgohClient = require('swgohClient')
const { GetAllyCodeObj, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let allyCode, pObj, msg2send = {content: 'You do not have allycode linked to discordId'}
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.allyCode) allyCode = dObj.allyCode
    if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !dObj.mentionError){
      msg2send.content = '**'+allyCode+'** is an invalid allyCode'
      pObj = await swgohClient('fetchPlayer', { allyCode: allyCode.toString() })
    }
    if(pObj?.allyCode){
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
      let overview = {
        name: 'Overview',
        value: '```autohotkey\n'
      }
      overview.value += 'GP'.padEnd(13)+':: '+numeral(pObj.gp).format('0,00')+'\n'
      overview.value += 'Char GP'.padEnd(13)+':: '+numeral(pObj.gpChar).format('0,00')+'\n'
      overview.value += 'Ship GP'.padEnd(13)+':: '+numeral(pObj.gpShip).format('0,00')+'\n'
      overview.value += 'Guild'.padEnd(13)+':: '+pObj.guildName+'\n'
      overview.value += 'level'.padEnd(13)+':: '+pObj.level+'\n'
      overview.value += '```'
      baseMsg.fields.push(overview)
      let modview = {
        name: 'Mods',
        value: '```autohotkey\n'
      }
      modview.value += 'R6'.padEnd(13)+':: '+pObj.summary.mod.r6+'\n'
      modview.value += 'Mods +10'.padEnd(13)+':: '+pObj.summary.mod[10]+'\n'
      modview.value += 'Mods +15'.padEnd(13)+':: '+pObj.summary.mod[15]+'\n'
      modview.value += 'Mods +20'.padEnd(13)+':: '+pObj.summary.mod[20]+'\n'
      modview.value += 'Mods +25'.padEnd(13)+':: '+pObj.summary.mod[25]+'\n'
      modview.value += '```'
      baseMsg.fields.push(modview)
      let relicview = {
        name: 'Relics ('+pObj.summary.relic.total+')',
        value: '```autohotkey\n'
      }
      relicview.value += 'R9'.padEnd(13)+':: '+pObj.summary.relic[9]+'\n'
      relicview.value += 'R8'.padEnd(13)+':: '+pObj.summary.relic[8]+'\n'
      relicview.value += 'R7'.padEnd(13)+':: '+pObj.summary.relic[7]+'\n'
      relicview.value += 'R6'.padEnd(13)+':: '+pObj.summary.relic[6]+'\n'
      relicview.value += 'R5'.padEnd(13)+':: '+pObj.summary.relic[5]+'\n'
      relicview.value += '```'
      baseMsg.fields.push(relicview)
      let qualityview = {
        name: 'Quality',
        value: '```autohotkey\n'
      }
      qualityview.value += 'Total'.padEnd(13)+':: '+numeral(pObj.summary.quality.total).format('0.00')+'\n'
      qualityview.value += 'Mod Quality'.padEnd(13)+':: '+numeral(pObj.summary.quality.mods).format('0.00')+'\n'
      qualityview.value += 'Gear Quality'.padEnd(13)+':: '+numeral(pObj.summary.quality.gear).format('0.00')+'\n'
      qualityview.value += 'Top 80 Mod Q'.padEnd(13)+':: '+numeral(pObj.summary.quality.top).format('0.00')+'\n'
      qualityview.value += '```'
      baseMsg.fields.push(qualityview)
      if(pObj.summary.dataCron){
        baseMsg.fields.push({
          name: 'DataCrons',
          value: '```autohotkey\n'+('Total').padEnd(13)+':: '+pObj.summary.dataCron.total+'\n```'
        })
        for(let i in pObj.summary.dataCron){
          if(i === 'total') continue
          if(!pObj.summary.dataCron[i]) continue
          let dcview = {
            name: configMaps.DataCronDefMap[pObj.summary.dataCron[i].id]?.nameKey+' ('+pObj.summary.dataCron[i].total+')',
            value: '```autohotkey\n'
          }
          for(let s = 10;s > 0;s--){
            if(!pObj.summary.dataCron[i][s]) continue
            dcview.value += ('L'+s).padEnd(13)+':: '+pObj.summary.dataCron[i][s]+'\n'
          }
          dcview.value += '```'
          baseMsg.fields.push(dcview)
        }
      }
      msg2send.embeds.push(baseMsg)
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
