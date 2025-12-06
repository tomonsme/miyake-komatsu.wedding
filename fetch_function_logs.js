const https=require('https')
const API="https://api.netlify.com/api/v1/sites/weddinginvitation-miyake-komatsu.netlify.app/functions/server/logs?type=tail&page=1&per_page=20"
https.get(API,res=>{if(res.statusCode!==200){console.error('HTTP ',res.statusCode);res.resume();return}
let data='';res.on('data',chunk=>data+=chunk);
res.on('end',()=>{
 try{
 const json=JSON.parse(data);
 console.log(json.map(l=>`${l.timestamp} ${l.message}`).join('\n'))
 }catch(e){console.error(e);console.log(data)}
})
}).on('error',err=>console.error(err))
