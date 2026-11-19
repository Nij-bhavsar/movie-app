// MOVIE API
const API_KEY = "f81262ea";
const API_URL = "https://www.omdbapi.com/";

let inp = document.querySelector("#inp");
let btn = document.querySelector("#subbtn");
let movieContainer = document.querySelector("#movieContainer");
let favoriteContainer = document.querySelector("#favoriteContainer");
let status = document.querySelector("#status");

// GET FAVORITES FROM LOCAL STORAGE
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// SEARCH MOVIES
if (btn && inp) {
    btn.addEventListener("click", () => {
        let movieName = inp.value.trim();
        if (movieName === "") {
            status.textContent = "Please enter a movie name!!";
            status.style.color = "red"
            return;
        }
        getMovies(movieName);
    });

    // Search using Enter key
    inp.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            btn.click();
        }
    });
}

// FETCH MOVIES FROM API
async function getMovies(movieName) {
    try {
        status.textContent = "Loading movies...";
        movieContainer.innerHTML = "";
        const url = `${API_URL}?s=${encodeURIComponent(movieName)}&apikey=${API_KEY}`
        console.log("Fetching URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.Response === "True") {
            status.textContent = "";
            displayMovies(data.Search);
        } else {
            status.textContent = data.Error;
            status.style.color = "red";
        }
    } catch (error) {
        console.log(error);
        status.textContent = "Error: ", error.message;
    }
}

// DISPLAY MOVIE CARDS
function displayMovies(movies) {
    movieContainer.innerHTML = "";
    movies.forEach((movie) => {
        const card = document.createElement("div");
        card.classList.add("moviecard");

        // Movie poster
        const poster = document.createElement("img");
        if (movie.Poster !== "N/A") {
            poster.src = movie.Poster;
        } 
        else {
                poster.src = "../assets/defaultposter.webp";
            }
        poster.onerror = function () {
        poster.onerror = null;
        poster.src = "./assets/defaultposter.webp";
            };

poster.alt = movie.Title;

        poster.style.cursor = "pointer";
        poster.addEventListener("click", () => {
            window.location.href = `./pages/details.html?id=${movie.imdbID}`;
        });

        // Movie title
        const title = document.createElement("h3");
        title.textContent = movie.Title;

        // Movie year
        const year = document.createElement("p");
        year.textContent = "Year: " + movie.Year;

        // Favorite button
        const favbtn = document.createElement("button");
        const alreadyAdded = favorites.some(
            (fav) => fav.imdbID === movie.imdbID
        );

        favbtn.textContent = alreadyAdded
            ? "❤️ Added to Favorites"
            : "🤍 Add to Favorites";

        favbtn.disabled = alreadyAdded;

        favbtn.addEventListener("click", () => {
            addFavorite(movie);
            favbtn.textContent = "❤️ Added to Favorites";
            favbtn.disabled = true;
        });

        // Add elements to card
        card.append(poster, title, year, favbtn);
        movieContainer.appendChild(card);
    });
}

// ADD MOVIE TO FAVORITES
function addFavorite(movie) {
    const exist = favorites.some(
        (fav) => fav.imdbID === movie.imdbID
    );
    if (exist) {
        return;
    }
    favorites.push(movie);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
    if (status) {
        status.textContent = "Movie added to Favorites!! ❤️";
    }
}

// DISPLAY FAVORITES PAGE
function displayFavorites() {
    
    if (!favoriteContainer) {
        return;
    }
    favoriteContainer.innerHTML = "";

    if (favorites.length === 0) {
        status.textContent = "No favorite movies added yet!!";
        return;
    }
    status.textContent = "";

    favorites.forEach((movie) => {
        const card = document.createElement("div");
        card.classList.add("moviecard");

        // Movie poster
        const poster = document.createElement("img");

        if (movie.Poster !== "N/A") {
            poster.src = movie.Poster;
        } 
        else {
                poster.src = "../assets/defaultposter.webp";
            }
        // for showing default photo for no image.
        poster.onerror = function () {
        poster.onerror = null;
        poster.src = "../assets/defaultposter.webp";
            };

        poster.style.cursor = "pointer";
        poster.addEventListener("click", () => {
            window.location.href = `details.html?id=${movie.imdbID}`;
        });

        // Movie title
        const title = document.createElement("h3");
        title.textContent = movie.Title;

        // Movie year
        const year = document.createElement("p");
        year.textContent = "Year: " + movie.Year;

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove Favorite";

        removeBtn.addEventListener("click", () => {
            removeFavorite(movie.imdbID);
        });
        card.append(poster, title, year, removeBtn);
        favoriteContainer.appendChild(card);
    });
}

// REMOVE MOVIE FROM FAVORITES
function removeFavorite(id) {
    favorites = favorites.filter(
        (movie) => movie.imdbID !== id
    );
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
    displayFavorites();
}

// detail movie page
async function getMovieDetails() {
    const detailsContainer = document.querySelector("#detailsContainer");
    const detailsStatus = document.querySelector("#detailsStatus")
    
    if (!detailsContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const movieID = params.get("id");

    if (!movieID) {
        detailsContainer.textContent = "Movie not found!";
        return;
    }

    try {
        detailsStatus.textContent = "Loading Movie details...";
        const response = await fetch(
            `${API_URL}?i=${movieID}&plot=full&apikey=${API_KEY}`
        );

        const movie = await response.json();
        console.log("Movie Details:", movie);

        if (movie.Response === "True") {
            detailsStatus.textContent = ""
            // details page data

            detailsContainer.innerHTML = `
                <div class="details-card">
                <img src="${movie.Poster !== "N/A" && movie.Poster ? movie.Poster : "../assets/defaultposter.webp"}" 
                    onerror="this.onerror=null; this.src='../assets/defaultposter.webp';">                    
                    <div>
                        <h1>${movie.Title}</h1>
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                    </div>
                </div>
            `;

        } else {
            detailsContainer.textContent = movie.Error;
            detailsStatus.style.color = "red";
        }

    } catch (error) {
        console.log(error);
        detailsContainer.textContent = "Unable to load movie details.";
    }
}

getMovieDetails();

// LOAD FAVORITES WHEN PAGE OPENS
displayFavorites();
if (movieContainer) {
    getMovies("Fast & Furious");

}