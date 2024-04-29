const https = require("https")

/**
* It tells you if the server is online (if you are going to request more data afterwards use {@link ApiData}'s .online attribute instead)
* @param {String} ip The server's ip or domain name
* @returns {Promise}
* @resolve {Boolean} if the server is offline or the API is not accesible it will be false
* @see api.mcsrvstat.us
*/

function isOnline(ip){
   return new Promise((resolve,reject)=>{
          request("https://api.mcsrvstat.us/simple/"+ip).then((data)=>{
                resolve(data.status.code==200)
          }).catch((err)=>{
                resolve(false)
          });
   });   
}
/**
* It gives you a {@link ApiData} Object with the information of the specified MC server
* @param {String} ip The server's ip or domain name
* @returns {Promise}
* @resolve {ApiData} The data from the api 
* @reject {Error<"Network Error">} The promise will throw a Network Error if there is a network problem 
* @reject {Error<404>} The api couldn't find the server
* @reject {Error<500>} The api failed 
* @see api.mcsrvstat.us
*/
function fetchData(ip){
    return new Promise((resolve,reject)=>{
         request("https://api.mcsrvstat.us/2/"+ip).then(response=>{//todo check if the link is correct
               switch(response.status.code){
                     case 500:
                     case 404:
                           resolve(new Error(response.status.code));
                     break;
                     default:
                           resolve(JSON.parse(response.body)) //todo Parse data
                     break;
               }
         }).catch((err)=>{
             reject(err)
         })
    });
}
/**
* A way to Cache ApiData
* @see api.mcsrv.us
*/
class McsrvstatCache{
    /**
     * 
     * @param {String} ip The server's ip or domain name
     * @param {Number} ttlInMs The Time-To-Live in MS
     * @param {Boolean} [loadBackup] if a back up needs to be loaded when having an error at getting data (default is true)
     * @param {Boolean} [restartTTLWhenError] if the ttl countdown needs to be restarted when having an error at getting data (default is true)
     */
    constructor(ip,ttlInMs,loadBackup,restartTTLWhenError){
        this.ip = ip;
        this.ttl = ttlInMs
        this.loadBackup = loadBackup || true;
        this.restart  = restartTTLWhenError || true;
        this.lastTime = Date.now()
        this.data = false;
        fetchData(this.ip).then((data)=>{
            this.data = data;
        }).catch((err)=>{
            this.data = err;
        })
    }
    /**
    * Gets the data from the cache or fetchs it from the server if the ttl countdown end 
    * @returns {Promise} 
    * @resolve {ApiData} The data from the API
    * @rejects {Error} If there is a network error the promise will throw this error, if there is a server side error check the status.code
    */
    getData(){
       if(Date.now()>=(this.lastTime+this.ttl)){
            return new Promise((resolve,reject)=>{
                fetchData(this.ip).then((data)=>{
                    this.data = data;
                    this.lastTime = Date.now();
                    resolve(data)
                }).catch((err)=>{
                    if(!this.loadBackup)this.data = err;
                    if(this.restart)this.lastTime = Date.now();
                    reject(err)
                });
            })
       }
       else return Promise.resolve(this.data);
    }
    /**
    * Forces the cache to fetch data, restarting the ttl countdown 
    * @param {Number} [ip] A new ip the overwrittes the current one
    * @returns {Promise} 
    * @resolve {ApiResponse} The response of the API
    * @rejects {Error} If there is a network error the promis will throw this error, if there is a server side error check the status.code
    */
    forceFetch(ip=this.ip){
         this.ip = ip
         return new Promise((resolve,reject)=>{
                fetchData(this.ip).then((data)=>{
                    this.data = data;
                    this.lastTime = Date.now();
                    resolve(data)
                }).catch((err)=>{
                    if(!this.loadBackup)this.data = err;
                    this.lastTime = Date.now();
                    reject(err)
                });
         });
    }
}
function request(url){
    return new Promise((resolve,reject)=>{
        https.get(url, (res) => {
            let body = ""
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on("end",()=>{
                var response = {
                    status:{
                        code:res.statusCode,
                        message:res.statusMessage
                    },
                    body,
                    headers:res.headers
                }
                resolve(response)
            });
        }).on('error', (e) => {
            reject(e)
        });
    })
}
/**
* @typedef {Object} ApiResponse
* @property {Number} status.code The HTTP Status Code
* @property {String} status.message The HTTP Status Message
* @property {String} body The requested {@link ApiData} without parsing
* @property {Object} headers The HTTP headers
*/

/**
* More info about other properties requested to the API can be seen at the API's website@see api.mcsrvstat.us
* @typedef {Object} ApiData 
* @prop {Boolean} online if this is false no other attribute should be expected
* @prop {String} ip The actual ip (if you used the domain name it will still return the ip)
* @prop {Number} port The port
* @prop {Object} debug Debug information
* @prop {Object} motd motd information
* @prop {Object} players Players information
* @prop {Number} players.online The amount of players online
* @prop {Number} players.max The max amount of players online
* @prop {Array<String>} [players.list] A list of the online players usernames (only included if players.online != 0)
* @prop {Object} players.uuid Asociates a uuid to each player, might not include all the players
* @prop {String} version The server's version
* @prop {Number} protocol The server's protocol number
* @see api.mcsrvstat.us
*/

module.exports = {Cache:McsrvstatCache, isOnline, fetchData, doHTTPRequest:request}
