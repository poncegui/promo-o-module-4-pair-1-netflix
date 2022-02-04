const express = require('express');
const cors = require('cors');
const moviesData = require('./data/movies.json');
const users = require('./data/users.json');

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

//Template engine - to get the movies id
server.get('/movie/:movieId', (req, res) => {
  console.log(req.params.movieId); //Show URL params
  const foundMovie = moviesData.find(
    (movie) => movie.id === req.params.movieId
  );
  console.log(foundMovie);
  res.render('pages/movie', foundMovie);
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
  console.log(req.query);
  const genderFilterParam = req.query.gender;
  const filteredMovies = moviesData
    .filter((movie) => movie.gender.includes(genderFilterParam))
    .sort(function (a, b) {
      if (a.title > b.title) {
        return 1;
      } else if (a.title < b.title) {
        return -1;
      }
      return 0;
    });

  res.json({
    success: true,
    movies: filteredMovies,
  });
});

//Endpoint post for login
server.post('/login', (req, res) => {
  console.log(req.body);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const foundUser = users.find(
    (user) => user.password === loginPassword && user.email === loginEmail
  );
  foundUser //Check if user exists
    ? res.json({
        success: true,
        userId: 'id_de_la_usuaria_encontrada',
      })
    : {
        success: false,
        errorMessage: 'Usuaria/o no encontrada/o',
      };
});
