var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/MatchDB";


function getBatData(){
      return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err,db)=>{
          if(err) reject(err) 
          let dbo = db.db("MatchDB");
          dbo.collection("Batting").find().toArray((err,res)=>{
                  let data = res;
                  db.close(); 
                  resolve(data) 
          });
        }) 
      })
 }

 function getBowlData(){
      return new Promise((resolve, reject) => {
          MongoClient.connect(url, (err,db)=>{
            if(err) reject(err) 
            let dbo = db.db("MatchDB");
            dbo.collection("Bowling").find().toArray((err,res)=>{
                    let data = res;
                    db.close(); 
                    resolve(data) 
            });
          }) 
      })
 }

 function getVariablesData(){
  return new Promise((resolve, reject) => {
      MongoClient.connect(url, (err,db)=>{
        if(err) reject(err) 
        let dbo = db.db("MatchDB");
        dbo.collection("Variables").find().toArray((err,res)=>{
                let data = res;
                db.close(); 
                resolve(data) 
        });
      }) 
  })
}

function addNewBat(Name,batsmenCount){
      return new Promise((resolve,reject)=> {
          MongoClient.connect(url, (err,db)=>{
            if(err) reject (err);
            let dbo = db.db("MatchDB");
            let query = {name:""};
            let newValue = {$set: {name:Name}};
            dbo.collection("Batting").updateOne(query, newValue, (err,res)=>{
                    if(err) throw err;
                    db.close();
                    resolve("Added new Batsman");
            });
        })
      })
 }
 
 function addNewBowl(Name){
      return new Promise((resolve,reject)=> {
        MongoClient.connect(url, (err,db)=>{
          if(err) reject (err);
          let dbo = db.db("MatchDB");
          let query = {name:""};
          let newValue = {$set: {name:Name}};
          dbo.collection("Bowling").updateOne(query, newValue, (err,res)=>{
                    if(err) throw err;
                    db.close();
                    resolve("Added New Bowler");
          });

        })
      })
  }

  function addRuns(strikerRuns,run,currBatsmen){
      return new Promise((resolve,reject)=> {
          MongoClient.connect(url, (err,db)=>{
            if(err) reject (err);
            let dbo = db.db("MatchDB");
            let query = {
              num: currBatsmen[0]+1
            };
            let updateRun = {$set: {runs:strikerRuns+run}};
                 dbo.collection("Batting").updateOne(query,updateRun, (err,res)=>{
                 db.close();
                 resolve("addRuns done!");
            })
          })
      })
  }

  function updateCount(coll,countData){
      return new Promise((resolve,reject)=>{
          MongoClient.connect(url, (err,db)=>{
              if(err) reject(err);
              let dbo = db.db("MatchDB");
              if(coll == "bat"){
                  let query = {
                    detail: "playersCountData"
                  };
                  let newValue = {$set:{batsmenPlayed: countData + 1}};
                  dbo.collection("Variables").updateOne(query, newValue, (err,res)=>{
                    if(err) throw err;
                  })
              }
              else if(coll == "bowl"){
                  let query = {
                    detail: "playersCountData"
                  };
                  let newValue = {$set:{bowlersPlayed: countData + 1}};
                  dbo.collection("Variables").updateOne(query, newValue, (err,res)=>{
                    if(err) throw err;
                  })
              }
              db.close();
              resolve("updateCount done!");
          })
      })
  }

  function changeBowler(newBowler){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, async(err,db)=>{
            if(err) reject(err);
            var dbo = db.db("MatchDB");

              function getNum(){
              return new Promise((res1,rej1)=>{
                let query = {name:newBowler}
                dbo.collection("Bowling").findOne(query, (dbErr,data)=>{
                  if(dbErr) rej1 (dbErr)
                  res1(data['num']);
                  })
                })
              }

            let newBowlerNum = await getNum();
            let query = {detail:"currBowlerData"};
            let newValue = {$set:{currBowler: newBowlerNum-1}};
            dbo.collection("Variables").updateOne(query, newValue, (err,res)=>{
              db.close();
              resolve("bowlerUpdated promise resolve!");
            })
        })
    })
  }

  function updateBowlerData(run){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, async(err,db)=>{
          if(err) reject(err);  
          var dbo = db.db("MatchDB");

          function getCurrBowler(){
            return new Promise((res1,rej1)=>{
              let query = {detail: "currBowlerData"};
              dbo.collection("Variables").findOne(query, (e,r)=>{
                if(e) reje(e);
                res1(r['currBowler']);
              })
            })
          }

          let currBowler = await getCurrBowler();
          function getBowlerData(){
            return new Promise((res2,rej2)=>{
              let query = {num: currBowler+1}
              dbo.collection("Bowling").findOne(query, (dbErr,data)=>{
                if(dbErr) rej2 (dbErr);
                res2( [data['runs'], data['balls']] );
              })
            })
          }

          let bowlerData = await getBowlerData();
          
          let tempBallsBowled = bowlerData[1]+1;
          let overs = parseInt(tempBallsBowled/6) + "." + parseInt(tempBallsBowled%6);
         // let economy = parseFloat(overs);
          let eco = parseFloat((bowlerData[0]+run)/parseFloat(overs)).toFixed(2);
          console.log(eco);
          let newQuery = {num: currBowler+1};
          let newValue = {$set:{
            overs: overs,
            runs: bowlerData[0] + run,
            balls: bowlerData[1] + 1,
            economy: eco
          }};
          dbo.collection("Bowling").updateOne(newQuery, newValue, (dbErr,data)=>{
            if(dbErr) throw dbErr ;
            db.close();
            resolve("Dunnit!");
          })
        })
    })
}


  function updateBatsmanData(run){
        return new Promise((resolve,reject)=>{
          MongoClient.connect(url, async(err,db)=>{
            if(err) reject(err);
            var dbo = db.db("MatchDB");

            function getCurrBatsman(){
              return new Promise((res1,rej1)=>{
                  let query = {detail: "strikerData"};
                  dbo.collection("Variables").findOne(query, (dbErr,data)=>{
                        if(dbErr) rej1(dbErr);
                        res1 (data['striker']);
                  })
              })
            }
            let striker = await getCurrBatsman();
            function strikerRuns(){
              return new Promise((res2,rej2)=>{
                  let query = {num: striker+1};
                  dbo.collection("Batting").findOne(query, (dbErr,data)=>{
                        if(dbErr) rej2(dbErr);
                        res2(data['runs']);
                  })
              })
            }
            let runScored = await strikerRuns();

            let query = {num: striker+1};
            let newValue = {$set:{
              runs: runScored + run
            }}
            dbo.collection("Batting").updateOne(query, newValue, (errr,ress)=>{
              resolve("Update batsman data resolved");
              db.close();
            })
            
          })
        })
  }

  function switchStrike(run,currBatsmen){
      return new Promise((resolve,reject)=>{
              MongoClient.connect(url, async(err,db)=>{
                  if (err) reject (err);
                  var dbo = db.db("MatchDB");

                  function switchStrikeRuns(){
                    return new Promise((res1,rej1)=>{
                      let query = {detail: "strikerData"};
                      let temp = currBatsmen[0];
                      let newValue = {
                        striker : currBatsmen[1],
                        nonStriker: temp
                      }
                      dbo.collection("Variables").updateOne(query,newValue, (dbErr,res)=>{
                        if(dbErr) rej1(dbErr);
                        res1("done!!!!!");
                      })

                    })
                  }

                  function getCurrBowler(){
                    return new Promise((res2,rej2)=>{
                      let query = {detail: "currBowlerData"};
                      dbo.collection("Variables").findOne(query, (e,r)=>{
                        if(e) reje(e);
                        res2(r['currBowler']);
                      })
                    })
                  }
        
                  let currBowler = await getCurrBowler();
                  function getBalls(){
                    return new Promise((res3,rej3)=>{
                      let query = {num: currBowler+1}
                      dbo.collection("Bowling").findOne(query, (dbErr,data)=>{
                        if(dbErr) rej3 (dbErr);
                        res3(data['balls']);
                      })
                    })
                  }

                  let ballsBowled = await getBalls();
                  console.log(ballsBowled);
                  if(run==1 || run==3){
                    await switchStrikeRuns();
                  }
              })
            })
  }
    


 app.get('/', async (req, res) => {
  let batData = await getBatData() ;
  let bowlData = await getBowlData();
  let varData = await getVariablesData();
  let currBatsmen = [varData[0]['striker'] , varData[0]['nonStriker']];
  let currBowler = varData[1]['currBowler'];
  let playersCount = [varData[2]['batsmenPlayed'], varData[2]['bowlersPlayed']];

  res.render('index', {
      batting: batData,
      bowling: bowlData,
      currBatsmen: currBatsmen,
      currBowler: currBowler,
      playersCount: playersCount
    });
  });

app.post('/', async (req, res) => {

  let varData = await getVariablesData();
  let playersCount = [varData[2]['batsmenPlayed'], varData[2]['bowlersPlayed']];
  let currBatsmen = [varData[0]['striker'] , varData[0]['nonStriker']];
  let currBowler = varData[1]['currBowler'];

  const keyArr = Object.keys(req.body);
  let whatSubmit = keyArr[keyArr.length-1];

  if(whatSubmit == 'batSubmit')
  {
    const batName = req.body.batName;
    await addNewBat(batName,playersCount[0]);
    await updateCount("bat", playersCount[0]);
  }

  else if(whatSubmit == 'bowlSubmit')
  {
    const bowlName = req.body.bowlName;
    await addNewBowl(bowlName);
    await updateCount("bowl",playersCount[1]);
  }

  else if(whatSubmit == 'runSubmit')
  {
    const run = parseInt(req.body.runs);
    await updateBatsmanData(run);
    await switchStrike(run, currBatsmen);
    await updateBowlerData(run);
  }
  else if(whatSubmit == 'selectBowlerSubmit')
  {
    let newBowler = req.body.selectBowler;
    await changeBowler(newBowler);
   
  }

  batData = await getBatData() ;
  bowlData = await getBowlData() ;
  varData = await getVariablesData();
  playersCount = [varData[2]['batsmenPlayed'], varData[2]['bowlersPlayed']];
  currBatsmen = [varData[0]['striker'] , varData[0]['nonStriker']];
  currBowler = varData[1]['currBowler'];

   
  res.render('index', {
    batting: batData ,
    bowling: bowlData,
    currBatsmen: currBatsmen,
    currBowler: currBowler,
    playersCount: playersCount
  });
});

app.listen(3000, ()=>{
    console.log("Server Running");
})