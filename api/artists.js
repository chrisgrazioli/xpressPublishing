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
      res.status(200).json({artists : rows});
    }
  });
});

artistsRouter.get('/:artistID',(req,res,next)=>{
  res.status(200).json({artist : req.artist});
});

artistsRouter.post('/', (req, res, next)=>{
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if(!name || !dateOfBirth || !biography){
    return res.sendStatus(400);
    //what is difference between res.sendStatus(400); and
    //return res.sendStatus(400);
  }else{
    db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)',
      {$name : name, $dateOfBirth : dateOfBirth, $biography : biography, $isCurrentlyEmployed : isCurrentlyEmployed}, function(error){
        if(error){
          next(error);
        }else{
          db.get(`SELECT * FROM Artist WHERE id= ${this.lastID}`, (error,row)=>{
            res.status(201).json({artist : row});
          });
        }
      });
  }
});

artistsRouter.put('/:artistID', (req, res, next)=>{
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if(!name || !dateOfBirth || !biography){
    return res.sendStatus(400);
  }else{
    db.run('UPDATE Artist SET name=$name , date_of_birth =$dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id= $artistID', {$name : name , $dateOfBirth : dateOfBirth , $biography : biography, $isCurrentlyEmployed : isCurrentlyEmployed, $artistID : req.params.artistID },
    function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistID}`, (error, row)=>{
          res.status(200).json({artist : row});
        });
      }
    });
  }
});

artistsRouter.delete('/:artistID', (req, res, next)=>{
  db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = ${req.params.artistID}`,(error)=>{
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistID}`, (error, row)=>{
        if(error){
          next(error);
        }else{
          res.status(200).json({artist :row});
        }
      });
    }
  });
});


module.exports= artistsRouter;
