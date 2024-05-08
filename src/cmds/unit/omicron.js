'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getSkillType = (id)=>{
  if(id.startsWith('basic')) return 'B'
  if(id.startsWith('leader')) return 'L'
  if(id.startsWith('special')) return 'S'
  if(id.startsWith('unique')) return 'U'
}
const cleanDesc = (string)=>{
  let retString = '', array = []
  string = string.replace(/\[c\]/g, '**')
  string = string.replace(/\[\/c]/g, '**')
  string = string.replace(/\[-\]/g, '')
  string = string.replace(/\[\w{1,6}\]/g, '')
  /*
  string = string.replace(/\[ffff33\]/g, '')
  string = string.replace(/\[f0ff23\]/g, '')
  string = string.replace(/\[FFCC33\]/g, '')
  */
  //string = string.replace(/\\n\n/g, '\n')
  array = string.split('\\n')
  for(let i in array) retString += array[i].replace('\\n','')+'\n'
  return retString
}
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let omiType = opt.type?.value
  if(!omiType) return { content: 'you did not provide an omicron type'}

  let skills = await mongo.find('omicronList', { type: omiType })
  if(!skills || skills?.length === 0) return { content: `There where no units with omicron for **${omiType}**` }

  skills = sorter([{order: 'ascending', column: 'unitNameKey'}], skills)
  let msg2send = { content: null, embeds: [], components: [] }
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(),
    title: omiType.toUpperCase()+' Omicrons ('+skills.length+')',
  }
  if(obj.selectValues && obj.selectValues[0]){
    let tempSkill = skills.find(x=>x.id === obj.selectValues[0])
    if(tempSkill){
      embedMsg.description = '**'+tempSkill.unitNameKey+' : '+tempSkill.nameKey+' ('+getSkillType(tempSkill.id)+')**\n'
      embedMsg.description += '```'+cleanDesc(tempSkill.descKey)+'```'
    }
  }
  msg2send.embeds.push(embedMsg)
  let count = 0, tempId = 0
  let tempComp = { type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, uId: tempId}), options:[]}] }
  for(let i in skills){
    let tempObj = {
      label: skills[i].unitNameKey+' ('+getSkillType(skills[i].id)+')',
      description: skills[i].nameKey,
      value: skills[i].id,
      default: (skills[i].id == obj.selectValues[0] ? true:false)
    }
    tempComp.components[0].options.push(tempObj)
    count++;
    if((+i + 1) == skills.length && count < 25 ) count = 25
    if(count == 25){
      if(tempComp.components[0].options.length > 0) msg2send.components.push(JSON.parse(JSON.stringify(tempComp)))
      tempId++
      tempComp.components[0].options = []
      tempComp.components[0].custom_id = JSON.stringify({id: obj.id, dId: obj.member?.user?.id, uId: tempId})
      count = 0
    }
  }
  if(msg2send?.components?.length > 0){
    await replyComponent(obj, msg2send, 'PATCH')
    return
  }
  return msg2send
}
