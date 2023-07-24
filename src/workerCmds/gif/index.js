'use strict'
const log = require('logger')
const { mongo, apiFetch, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
const GIPHY_API_KEY = process.env.GIPHY_API_KEY
module.exports = async(obj = {})=>{
  try{
    let msg2Send = {content: 'Error with search'}
    let searchTerm = GetOptValue(obj.data?.options, 'query')
    if(searchTerm){
      const gifs = await apiFetch("http://api.giphy.com/v1/gifs/search?api_key="+GIPHY_API_KEY+"&q="+encodeURI(searchTerm))
      if(gifs?.data?.length > 0 && gifs.data[0].embed_url){
        msg2Send.content = gifs.data[0].embed_url
      }else{
        msg2Send.content = 'Could not find a gif for **'+searchTerm+'**'
      }
    }else{
      msg2Send.content = 'You did not provide a search string'
    }
    await ReplyMsg(obj, msg2Send)
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
