'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You must specify a @user'}, usr
    let dId = await GetOptValue(opt, 'user')
    let crLimit = await GetOptValue(opt, 'cr-limit')
    let vipLevel = await GetOptValue(opt, 'level')
    let status = await GetOptValue(opt, 'status')
    if(!dId) dId = await GetOptValue(opt, 'discordid')
    if(dId){
      if(obj.data && obj.data.resolved){
        if(obj.data.resolved.members && obj.data.resolved.members[dId] && obj.data.resolved.members[dId].nick) usr = obj.data.resolved.members[dId].nick
        if(!usr && obj.data.resolved.users && obj.data.resolved.users[dId] && obj.data.resolved.users[dId].username) usr = obj.data.resolved.users[dId].username
      }
      msg2send.content = (usr ? '**@'+usr+'**':'that user')+' is not a vip member'
      const pObj = (await mongo.find('vip', {_id: dId}))[0]
      if(pObj){
        delete pObj._id
        delete pObj.TTL
        if(crLimit >= 0) pObj.crLimit = crLimit
        if(vipLevel >= 0) pObj.level = vipLevel
        if(status >= 0) pObj.status = status
        await mongo.set('vip', {_id: dId}, pObj)
        const embedMsg = {
          color: 15844367,
          title: (usr ? '**@'+usr+'**':'User')+' VIP Info',
          description: '```\n'
        }
        embedMsg.description += 'Discord ID : '+dId+'\n'
        embedMsg.description += 'Level      : '+pObj.level+'\n'
        embedMsg.description += 'Status     : '+(pObj.status ? 'enabled':'disabled')+'\n'
        embedMsg.description += 'CR Limit   : '+(pObj.crLimit ? pObj.crLimit:100)+'\n'
        embedMsg.description += '```'
        msg2send.embeds = [embedMsg]
        msg2send.content = null
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
