'use strict'
module.exports = async(obj = {})=>{
  try{
    let msg2Send = {content: 'Error with search'}
    let searchTerm = await HP.GetOptValue(obj.data?.options, 'query')
    if(searchTerm){
      const gifs = await HP.apiFetch("http://api.giphy.com/v1/gifs/search?api_key="+process.env.GIPHY_API_KEY+"&q="+encodeURI(searchTerm))
      if(gifs?.data?.length > 0 && gifs.data[0].embed_url){
        msg2Send.content = gifs.data[0].embed_url
      }else{
        msg2Send.content = 'Could not find a gif for **'+searchTerm+'**'
      }
    }else{
      msg2Send.content = 'You did not provide a search string'
    }
    HP.ReplyMsg(obj, msg2Send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
