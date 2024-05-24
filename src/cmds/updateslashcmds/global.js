'use strict'
const mongo = require('mongoclient')
const { addGlobalCmd } = require('src/helpers/discordmsg')

module.exports = async(obj = {})=>{
  let payload = {}, globalCmds = []
  let slashCmds = await mongo.find('slashCmds', payload)
  if(!slashCmds || slashCmds?.length == 0) return { content: 'There are no slashCmds saved in the database' }

  for(let i in slashCmds){
    let tempCmds = []
    tempCmds = slashCmds[i].cmds.filter(x=>x.type && x.type.includes('public') && !x?.hidden).map(c=>c.cmd)
    if(tempCmds.length > 0) globalCmds = globalCmds.concat(tempCmds)
  }
  if(!globalCmds || globalCmds?.length == 0) return { content: "Error parsing SlashCmds" }
  await mongo.set('tempSlashCmdUpdate', { _id: 'global' }, { data: globalCmds })
  //console.log(globalCmds[21])
  let status = await addGlobalCmd(globalCmds, 'PUT')
  return { content: `**${(status?.length >= 0 ? status.length:0)}** of **${globalCmds.length}** global commands where updated`}
}
