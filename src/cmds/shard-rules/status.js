'use strict'
const { GetGuild } = require('src/helpers/discordmsg')
const { getRole } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'There are no shard rules set up'}
  if(!shard.rules) return msg2send
  let guild = await GetGuild(shard.sId)
  let embedMsg = {
    color: 15844367,
    title: (guild && guild.guildName ? guild.guildName+' ':'')+'Payout Server Rules Watch',
    fields: []
  }
  let enemyEmoji = {
    name: 'Enemy Emoji(s)',
    value: 'No enemy emoji(s) defined'
  }
  if(shard.rules.enemy && shard.rules.enemy.length > 1){
    enemyEmoji.value = '```\n'
    for(let i in shard.rules.enemy){
      if(shard.rules.enemy[i] != ':rage:') enemyEmoji.value += shard.rules.enemy[i]+' '
    }
    enemyEmoji.value += '\n```'
  }
  embedMsg.fields.push(enemyEmoji)
  let enemyHits = {
    name: 'Enemy Hits',
    value: 'Disabled'
  }
  if(shard.rules.enemyHits && shard.rules.enemyHits.status){
    let role
    if(shard.rules.enemyHits.roleId) role = await getRole(shard.sId, shard.rules.enemyHits.roleId)
    enemyHits.value = ''
    enemyHits.value += 'Channel       : <#'+shard.rules.enemyHits.chId+'>\n'
    enemyHits.value += 'Notify Player : '+shard.rules.enemyHits.notify+'\n'
    if(shard.rules.enemyHits.roleId) enemyHits.value += 'Notify Role   : @'+(role ? role.name:'UNKNOW')+'\n'
  }
  embedMsg.fields.push(enemyHits)
  let earlyHits = {
    name: 'Early hits on friendlies',
    value: 'Disabled'
  }
  if(shard.rules.earlyHits && shard.rules.earlyHits.status){
    let role
    if(shard.rules.earlyHits.roleId) role = await getRole(shard.sId, shard.rules.earlyHits.roleId)
    earlyHits.value = ''
    earlyHits.value += 'Channel                          : <#'+shard.rules.earlyHits.chId+'>\n'
    earlyHits.value += 'Notify Player                    : '+shard.rules.earlyHits.notify+'\n'
    if(shard.rules.earlyHits.roleId) earlyHits.value += 'Notify Role                      : @'+(role ? role.name:'UNKNOW')+'\n'
    earlyHits.value += 'Ignore if player is closer to po : '+(shard.rules.earlyHits.closer ? 'Enabled':'Disabled')+'\n'
    earlyHits.value += 'Hours before po protected        : '+shard.rules.earlyHits.hour+'\n'
    if(shard.rules['top-rank']) earlyHits.value += 'Ranks =< new rank to check       : '+shard.rules['top-rank']+'\n'
    if(shard.rules['bottom-rank']) earlyHits.value += 'Ranks >= old rank to check       : '+shard.rules['bottom-rank']+'\n'
  }
  embedMsg.fields.push(earlyHits)
  let enemySkips = {
    name: 'Enemy Skip when hitting a friendly',
    value: 'Disabled'
  }
  if(shard.rules.enemySkips && shard.rules.enemySkips.status){
    let role
    if(shard.rules.enemySkips.roleId) role = await getRole(shard.sId, shard.rules.enemySkips.roleId)
    enemySkips.value = ''
    enemySkips.value += 'Channel                               : <#'+shard.rules.enemySkips.chId+'>\n'
    enemySkips.value += 'Notify Player                         : '+shard.rules.enemySkips.notify+'\n'
    if(shard.rules.enemySkips.roleId) enemySkips.value += 'Notify Role                           : @'+(role ? role.name:'UNKNOW')+'\n'
    enemySkips.value += '# of Ranks =< new rank to check       : '+(shard.rules['top-rank'] ? shard.rules['top-rank']:2)+'\n'
    if(shard.rules['bottom-rank']) enemySkips.value += '# of Ranks > old rank to check        : '+shard.rules['bottom-rank']+'\n'
  }
  embedMsg.fields.push(enemySkips)
  msg2send.content = null
  msg2send.embeds = [embedMsg]

  return msg2send
}
