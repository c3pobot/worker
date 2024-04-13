'use strict'
const log = require('logger')
const UpdateSyncGuilds = async()=>{
  try{
    let obj = await mongo.find('guilds', {sync: 1}, {_id: 1, sync: 1})
    if(obj){
       obj = obj.filter(x=>x.sync && x._id).map(x=>x._id)
       syncGuilds = obj
    }
    setTimeout(UpdateSyncGuilds, 30000)
  }catch(e){
    log.error(e);
    setTimeout(UpdateSyncGuilds, 30000)
  }
}
module.exports = UpdateSyncGuilds
