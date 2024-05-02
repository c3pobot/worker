'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = {})=>{
  let crQuery = opt.query?.value?.toString()?.trim()?.toLowerCase()
  let lcr = (await mongo.find('reactions', {_id: 'global'}))[0]
  if(!lcr?.cr || lcr?.cr?.length == 0) return { content: 'There are no global reactions'}

  let cr = lcr.cr
  if(crQuery) cr = cr.filter(x=>x.trigger?.toLowerCase()?.includes(crQuery))
  if(cr?.length == 0) return { content: `There are no global reactions that include **${crQuery}**...`}

  cr = sorter([{column: 'trigger', order: 'ascending'}], cr)
  let msg2send = { content: null, embeds: [] }
  let fieldsArray = []
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
    if(i == 0) embedMsg.title = "Global Custom Reactions"
    for(let j in fieldsArray[i]) embedMsg.description += '`'+fieldsArray[i][j].id+'` : '+fieldsArray[i][j].trigger+'\n';
    msg2send.embeds.push(embedMsg)
  }
  return msg2send
}
