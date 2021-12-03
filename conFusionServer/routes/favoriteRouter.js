const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Favorites.find({})
        .populate('user.firstname')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
           .catch((err) => next(err));
    })

.post(cors.corsWithOptions, (req,res,next) => { 
    Favorites.create(req.body)
    .then((favorite) => {
        console.log('Favorite Added ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
        .catch((err) => next(err));
    })

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
    })

module.exports = favoriteRouter;