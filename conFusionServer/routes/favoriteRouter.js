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
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({"user": req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
           .catch((err) => next(err));
    })

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    Favorites.find({"user": req.user._id})
    .then((favorite) => {
        if (favorite.length > 0) // user has favorites
            {
             // console.log("entra en no null");
             // console.log(favorite.length);
            for (var i = 0; i < req.body.dishes.length; i++) 
                {                  
                    if (favorite[0].dishes.indexOf(req.body.dishes[i]._id) === -1)
                       {
                        favorite[0].dishes.push(req.body.dishes[i]._id);
                       }
                } 
                        favorite[0].save()
                        .then((favorite) => {
                            console.log('Favorite Added ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));             
                
            }

        else // user hasn't favorites
            {
                Favorites.create(req.body)
                .then((favorite) => {
                    console.log('Favorite Added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                    .catch((err) => next(err));

            }
        })
    })

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
    })

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
        Favorites.findOneAndRemove({"user": req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
            .catch((err) => next(err));               
        });
 
favoriteRouter.route('/:dishId')
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    Favorites.find({"user": req.user._id})
    .then((favorite) => {
        if (favorite.length > 0) // user has favorites
            {
            for (var i = 0; i < favorite[0].dishes.length; i++) 
                {                  
                    if (favorite[0].dishes.indexOf(req.params.dishId) === -1)
                       {
                        favorite[0].dishes.push(req.params.dishId);
                       }
                } 
                        favorite[0].save()
                        .then((favorite) => {
                            console.log('Favorite Added ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));             
                
            }

        else // user hasn't favorites
            {
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()})
                    .then((favorite) =>{
                    console.log('Favorite Added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                    .catch((err) => next(err));

            }
        })
    })

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
    })

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({"user": req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            favorite[0].dishes.remove(req.params.dishId)
                favorite[0].save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }        
        else {
            err = new Error('Favorite ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
            }
    }, (err) => next(err))
        .catch((err) => next(err));
    });



module.exports = favoriteRouter;
