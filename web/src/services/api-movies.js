// login

const getMoviesFromApi = (genderObjectParam) => {
  console.log({ genderObjectParam });
  console.log('Se están pidiendo las películas de la app');
  //Create query params
  const queryParams = `?gender=${genderObjectParam.gender}&sort=${genderObjectParam.sort}`;

  return fetch(`http://localhost:4000/movies${queryParams}`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const objToExport = {
  getMoviesFromApi: getMoviesFromApi,
};

export default objToExport;
