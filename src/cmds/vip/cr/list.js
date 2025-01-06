'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
module.exports = async(obj = {}, opt = {})=>{
  let cr = []
  let crQuery = opt.query?.value?.trim()?.toLowerCase()
  let localCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]
  if(localCR?.cr) cr = localCR.cr
  if(crQuery){
    cr = cr.filter(x=>x.trigger.toLowerCase().includes(crQuery))
    if(cr?.length == 0) return { content: `There where no custom reactions that matched **${crQuery}**` }
  }
  cr = sorter([{ column: 'trigger', order: 'ascending' }], cr) || []
  if(cr?.length == 0) return { content: `You have no personal custom reactions..` }
  let fieldsArray = []
  let embeds = []
  if(cr.length > 25){
    for(let i=0;i<cr.length;i+=25) fieldsArray.push(cr.slice(i, (+i +25)));
  }else{
    fieldsArray.push(cr)
  }
  for(let i in fieldsArray){
    let embedMsg = {
      color: 15844367,
      description: ""
    }
    if(i == 0) embedMsg.title = "Personal Custom Reactions"
    for(let j in fieldsArray[i]) embedMsg.description += '`'+fieldsArray[i][j].id+'` : '+fieldsArray[i][j].trigger+'\n';
    embeds.push(embedMsg)
  }
  return { embeds: embeds }  
}
