# mcsrv-api
An **NPM** module that receives data from the ``api.mcsrvstat.us`` API.  
## isOnline(``serverIp``)-->``{Promise}:bool``
The isOnline function allows you to know if a minecraft server is online by using a the status codes of simple http response without any body 
```js
//prints a custom message depending if the server is or is not online
mcsrv.isOnline("jongames.com").then((bool)=>{
  console.log("The server is"+(bool?"":"not")+" online")
})
```
## fetchData(``serverIp``)-->``{Promise}:{ApiData:Object}``
The fetchData function allows you to get the api's information as an object
```js
//prints the usernames of the online players
mcsrv.isOnline("jongames.com").then((data)=>{
  data.players.list.forEach((username)=>{
      console.log(username);
  });
})
```
## request()
## class: Cache
