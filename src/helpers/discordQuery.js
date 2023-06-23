'use strict'
const { apiRequest } = require('discordapiwrapper')
module.exports = async(uri, method = 'GET', body, headers)=>{
  try{
    const res = await apiRequest(uri, method, body, headers)
    if(res?.body) return res.body
    if(res?.status) return res.status
  }catch(e){
    console.error(e);
  }
}
