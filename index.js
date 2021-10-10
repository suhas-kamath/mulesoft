const mongoose = require('mongoose')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded());
app.set("view engine", 'ejs');
mongoose.connect('mongodb+srv://njclab:sTDqSwC-azQj3_@@cluster0.ns3tc.mongodb.net/movies-db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
})

const Movie = mongoose.model('Movie', {
    movieName: {
        type: String,
        required: true,
    },
    actor: {
        type: String,
        required: true,
    },
    actress: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
    },
    director: {
        type: String,
        required: true
    }
})

app.get('/', async (req, res) => {
    try {
        const years = []
        const movies = await Movie.find({})
        movies.forEach(movie => {
            if (!years.includes(movie.year)) {
                years.push(movie.year)
            }

        });
        res.render("index", { movies, years })
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
})


app.post('/', async (req, res) => {

    const movie = new Movie(req.body)
    const countMovie = await Movie.countDocuments({ movieName: movie.movieName })
    if (countMovie == 0) {
        try {
            await movie.save()
            res.redirect('/')
        } catch (error) {
            res.status(400).send("Client Error")
        }
    } else {
        res.status(400).send("Movie already Exists")
    }
})


app.get('/movies/:movie', async (req, res) => {
    try {
        const query = req.params.movie;
        const movies = await Movie.find({ "movieName": new RegExp('.*' + query + '.*', 'ig') },
        )
        if (movies.length == 0) return res.status(404).send("No records found")
        res.render("details", { movies, query })

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})


app.get('/search/', async (req, res) => {
    try {
        const query = req.query.search;
        const movies = await Movie.find({
            $or: [
                { "movieName": new RegExp('.*' + query + '.*', 'ig') },
                { "actor": new RegExp('.*' + query + '.*', 'ig') },
                { "actress": new RegExp('.*' + query + '.*', 'ig') },
                { "director": new RegExp('.*' + query + '.*', 'ig') },
            ]
        })
        if (movies.length == 0) return res.status(404).send("No records found")
        res.render("details", { movies, query })

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})


app.get('/year/:year', async (req, res) => {
    try {
        const movies = await Movie.find({ "year": req.params.year })
        if (movies.length == 0) return res.status(404).send("No records found")
        res.render("details", { movies, query: req.params.year + " Archive" })
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})



app.listen(port, () => {
    console.log("Listening to port " + port)
})
