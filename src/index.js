const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

//Set template middleware
server.set('view engine', 'ejs');

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//Init and config data base
const db = new Database('./src/db/database.db', {
  verbose: console.log, //log in console all data base queries
});

//Template engine - to get the movies id
server.get('/movie/:movieId', (req, res) => {
  console.log(req.params.movieId); //Show URL params
  const movieId = req.params.movieId; //movie id that we get by qparams
  const query = db.prepare(`SELECT * FROM movies WHERE id=?`);
  const movie = query.get(movieId); //We pass de id to execute the query
  res.render('pages/movie', movie); //Render the template with the data of query
});

// Static Server
const staticServerPathWeb = './src/public-react'; // Static files
server.use(express.static(staticServerPathWeb));

// Static Server for images
const staticServerPathImages = './src/public-movies-images'; // Static files
server.use(express.static(staticServerPathImages));

// Static Server for css
const staticServerPathCss = './src/public-movies-images'; // Static files
server.use(express.static(staticServerPathCss));

//Endpoints
server.get('/movies', (req, res) => {
  if (req.query.gender) {
    const query = db.prepare(
      `SELECT * FROM movies WHERE gender= ? ORDER BY title DESC`
    );
    const movies = query.all(req.query.gender);
    res.json({
      success: true,
      movies,
    });
  } else {
    const query = db.prepare(`SELECT * FROM movies `);
    const movies = query.all();

    res.json({
      success: true,
      movies,
    });
  }
});

//Endpoint post for login
server.post('/login', (req, res) => {
  console.log(req.body);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const query = db.prepare(
    `SELECT id FROM users WHERE email = ? AND password = ?`
  );
  const userId = query.get(loginEmail, loginPassword);
  userId //if query returns a user, then it returns its id
    ? res.json({
        success: true,
        userId,
      })
    : res.json({
        //Else, it returns an error message
        success: false,
        errorMessage: 'Usuaria/o no encontrada/o',
      });
});
