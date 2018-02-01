const express = require('express');
const issuesRouter= express.Router({mergeParams:true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next)=>{
  db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesID}`, (error, rows)=>{
    if(error){
      next(error);
    }else{
      res.status(200).json({issues: rows});
    }
  });
});

issuesRouter.post('/', (req, res, next)=>{
  const name =req.body.issue.name;
  const issueNumber=req.body.issue.issueNumber;
  const publicationDate=req.body.issue.publicationDate;
  const artistId=req.body.issue.artistId;
  const seriesId=req.params.seriesID;

  if(!name || !issueNumber || !publicationDate || !artistId){
    res.sendStatus(400);
  }else{
    db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)',{$name: name, $issueNumber:issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId :seriesId}, function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, row)=>{
          if(error){
            next(error);
          }else{
            res.status(201).json({issue: row});
          }
        });
      }
    });
  }
});

issuesRouter.param('/:issueId', (req, res, next, issueId)=>{
  db.get(`SELECT * FROM Issue WHERE id = ${issueId}`,(error, row)=>{
    if(error){
      /*next(error); */res.sendStatus(404);
    }else{
      next();
    }
  });
});

issuesRouter.put('/:issueId', (req, res, next)=>{
  const name =req.body.issue.name;
  const issueNumber=req.body.issue.issueNumber;
  const publicationDate=req.body.issue.publicationDate;
  const artistId=req.body.issue.artistId;
  db.get(`SELECT * FROM Artist WHERE id = ${artistId}`,(error, row)=>{
    if(!row){
      res.sendStatus(404);
    }else{
      if(!name || !issueNumber || !publicationDate || !artistId){
        res.sendStatus(404);
      }
      db.run('UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE id = $issueId', {$name:name, $issueNumber:issueNumber, $publicationDate: publicationDate, $artistId: artistId, $issueId : req.params.issueId}, function(error){
        if(error){
          next(error);
        }else{
          db.get('SELECT * FROM Issue WHERE id = $issueId',{$issueId: req.params.issueId}, (error, row)=>{
              res.status(200).json({ issue : row });
          });
        }

      });


    }
  });
});


issuesRouter.delete('/:issueId', (req, res, next)=>{
  db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, function(error){
    if(error){
      next(error);
    }
    res.sendStatus(204);
  });
});
module.exports =issuesRouter;
