'use strict'
const JobCache = require('./jobCache')
const { WebHookMsg } = require('discordapiwrapper')
module.exports = async(obj = {}, msg)=>{
  try{
    await redis.setTTL('button-'+obj.id, obj, 600)
    const job = await JobCache.getJob(obj)
    if(!job) return;
    await WebHookMsg(obj?.token, {
      content: msg,
      components: [{
        type: 1,
        flags: 64,
        components: [
          {
            type: 2,
            label: 'Yes',
            style: 3,
            custom_id: JSON.stringify({id: obj.id, response: 'yes'})
          },
          {
            type: 2,
            label: 'No',
            style: 4,
            custom_id: JSON.stringify({id: obj.id, response: 'no'})
          }
        ]
      }]
    }, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
