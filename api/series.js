const express = require('express');
const seriesRouter= express.Router();
const issuesRouter=require('./issues');

const sqlite3=require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.use('/:seriesID/issues', issuesRouter);

seriesRouter.get('/', (req,res, next)=>{
  db.all('SELECT * FROM Series', (error, rows)=>{
    if(error){
      next(error);
    }else{
      res.status(200).json({series:rows});
    }
  });
});

seriesRouter.param('seriesID', (req, res, next, seriesID)=>{
  db.get('SELECT * FROM Series WHERE id = $id', {$id : seriesID}, (error, row)=>{
    if(error){
      next(error);
    }else if(row){
        req.series=row;
        next();
      }else{
        res.sendStatus(404);
      }
    });
});

seriesRouter.get('/:seriesID', (req,res,next)=>{
  res.status(200).json({series : req.series});
});

seriesRouter.post('/', (req, res, next)=>{
  const name= req.body.series.name;
  const description= req.body.series.description;
  if(!name || !description){
    res.sendStatus(400);
  }else{
    db.run('INSERT INTO Series (name, description) VALUES($name, $description)', {$name: name, $description: description}, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Series WHERE id =${this.lastID}`, (error, row)=>{
          res.status(201).json({series: row});
        });
      }
    });
  }
});

seriesRouter.put('/:seriesID', (req,res,next)=>{
  const name= req.body.series.name;
  const description= req.body.series.description;
  if(!name || !description){
    res.sendStatus(400);
  }else{
    db.run('UPDATE Series SET name=$name, description=$description WHERE id= $id', {$name:name, $description :description, $id: req.params.seriesID},function(error){
      if(error){
        next(error)
      }else{
        db.get(`SELECT * FROM Series WHERE id= ${req.params.seriesID}`, (error, row)=>{
          if(error){
            next(error);
          }else{
            res.status(200).json({series:row});
          }
        });
      }
    });
  }
});

seriesRouter.delete('/:seriesID', (req, res, next)=>{

});

module.exports = seriesRouter;
