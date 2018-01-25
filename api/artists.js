const express=require('express');
const artistsRouter= express.Router();
const sqlite3=require('sqlite3');
const db =  new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistID', (req, res, next, artistID)=>{
  db.get('SELECT * FROM Artist WHERE id = $id', {$id : artistID}, (error, row)=>{
    if(error){
      next(error);
    }else if(row){
        req.artist=row;
        next();
      }else{
        res.sendStatus(404);
      }
    });
});
artistsRouter.get('/', (req, res, next)=>{
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows)=>{
    if(error){
      next(error);
    }else{
      res.status(200).json({artists:rows});
    }
  });
});

artistsRouter.get('/:artistID',(req,res,next)=>{
  res.status(200).json({artist:req.artist});
});

module.exports= artistsRouter;
