'use strict'
const GetSkillType = (id)=>{
  if(id.startsWith('basic')) return 'B'
  if(id.startsWith('leader')) return 'L'
  if(id.startsWith('special')) return 'S'
  if(id.startsWith('unique')) return 'U'
}
const CleanDesc = (string)=>{
  try{
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
  }catch(e){
    console.log(e)
  }
}
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'error getting info'}, skills, webData, screenShot, skillId
    if(obj?.select?.data[0]) skillId = obj.select.data[0]
    const omiType = HP.GetOptValue(opt, 'type')
    if(omiType){
      msg2send.content = 'there where no units with omicron for **'+omiType+'**'
      skills = await mongo.find('omicronList', {type: omiType})
    }
    if(skills?.length > 0){
      skills = await sorter([{order: 'ascending', column: 'unitNameKey'}], skills)
      msg2send.content = null
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: omiType.toUpperCase()+' Omicrons ('+skills.length+')',
      }
      if(skillId){
        const tempSkill = skills.find(x=>x.id === skillId)
        if(tempSkill){
          embedMsg.description = '**'+tempSkill.unitNameKey+' : '+tempSkill.nameKey+' ('+GetSkillType(tempSkill.id)+')**\n'
          embedMsg.description += '```'+CleanDesc(tempSkill.descKey)+'```'
        }
      }
      msg2send.embeds = [embedMsg]
      msg2send.components = []
      let count = 0, tempId = 0
      let tempComp = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, uId: tempId}), options:[]}]}
      for(let i in skills){
        const tempObj = {
          label: skills[i].unitNameKey+' ('+GetSkillType(skills[i].id)+')',
          description: skills[i].nameKey,
          value: skills[i].id,
          default: (skills[i].id == skillId ? true:false)
        }
        tempComp.components[0].options.push(tempObj)
        count++;
        if((+i + 1) == skills.length && count < 25 ) count = 25
        if(count == 25){
          if(tempComp.components[0].options.length > 0) msg2send.components.push(JSON.parse(JSON.stringify(tempComp)))
          tempId++
          tempComp.components[0].options = []
          tempComp.components[0].custom_id = JSON.stringify({id: obj.id, uId: tempId})
          count = 0
        }
      }
    }

    if(msg2send?.components?.length > 0){
      await HP.ReplyComponent(obj, msg2send, 'PATCH')
    }else{
      HP.ReplyMsg(obj, msg2send)
    }
  }catch(e){
    console.error(e)
  }
}
