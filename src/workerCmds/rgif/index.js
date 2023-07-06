'use strict'
const { mongo, apiFetch, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
module.exports = async(obj = {})=>{
  try{
    let searchTerm, msg2Send = {content: 'Error with search'}
    let searchTerm = await GetOptValue(obj.data?.options, 'query')
    if(searchTerm){
      const gifs = await apiFetch("http://api.giphy.com/v1/gifs/search?api_key="+process.env.GIPHY_API_KEY+"&q="+encodeURI(searchTerm))
      if(gifs && gifs.data && gifs.data.length > 0){
        let imgIndex = Math.floor(Math.random() * (+gifs.data.length))
        if(gifs.data.length > 30){
          imgIndex = Math.floor(Math.random() * 30)
        }
        if(gifs.data[imgIndex].embed_url){
          msg2Send.content = gifs.data[imgIndex].embed_url
        }else{
          msg2Send.content = 'Could not find a gif for **'+searchTerm+'**'
        }
      }else{
        msg2Send.content = 'Could not find a gif for **'+searchTerm+'**'
      }
    }else{
      msg2Send.content = 'You did not provide a search string'
    }
    ReplyMsg(obj, msg2Send)
  }catch(e){
    console.error(e)
    ReplyError(obj)
  }
}
