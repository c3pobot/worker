'use strict'
const JobCache = require('./jobCache')
const botRequest = require('botrequest')
module.exports = async(obj = {}, content)=>{
  try{
    return await botRequest('sendMsg', obj)
  }catch(e){
    throw(e);
  }
}
