const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let guilds = await mongo.find('guilds', {}, { _id: 1, guildName: 1, sync: 1 })
  guilds = guilds?.filter(x=>x?.sync > 0) || []
  if(!guilds || guilds?.length == 0) return { content: 'There are no synced guilds...' }

  let msg2send = { content: `Current synced guilds (${guilds.length})\n` }
  for(let i in guilds){
    msg2send.content += `[ ${guilds[i].guildName || guilds[i]._id} ](<https://swgoh.gg/g/${guilds[i]._id}/>)\n`
  }
  return msg2send
}
