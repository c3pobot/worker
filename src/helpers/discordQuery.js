'use strict'
const { apiRequest } = require('discordapiclient')
module.exports = async(uri, method = 'GET', body, headers = {})=>{
  try{
    if(body) headers['Content-Type'] = 'application/json'
    const res = await apiRequest(uri, method, body, headers)
    if(res?.body) return res.body
    if(res?.status) return res.status
  }catch(e){
    throw(e);
  }
}
