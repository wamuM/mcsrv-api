function isOnline(server){
      
}
function fetchData(server){

}
class MyCache{
    constructor(ip,ttlInMs,loadBackup){
        this.ip = ip;
        this.ttl = ttlInMs
        this.loadBackup = loadBackup || true; 
        this.lastTime = Date.now()
        try{
        this.data = await fetchData(this.ip)
        }catch(e){
        this.data = e;
        }
    }
    getData(){
       if(Date.now()>=(this.lastTime+this.ttl)){
            return new Promise((resolve,reject)=>{
                fetchData(this.ip)
            })
       }
       else return Promise.resolve(this.data)
    }
}
function request(ip){
    return Promise((resolve,reject)=>{
        let xhr = new XMlHttpRequest()
        xhr.open("GET",ip,true)
        xhr.onload = ()=>{
           var response = {
               status:{
                  code:xhr.status,
                  text:xhr.statusText
               },
               body:xhr.response
               headers:xhr.getAllHeaders().split("\r\n")
           }
           resolve(response)
        }
        xhr.onerror = ()=>{
           reject(new Error("Network Error"))
        }
        xhr.send(null)
    })
}

module.exports = {Cache:MyCache, isOnline, fetchData}
