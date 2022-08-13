const express = require("express");
const router = express.Router()
const user_repository = require('./repositories/user_repository')
const season_repository = require('./repositories/season_repository')
const log_repository = require('./repositories/log_repository')
//----------------------------Auth----------------------------------
router.get('/auth/:id', (req, res) => {
    const { id } = req.params;
    user_repository.getUser(id).then(user => {
        res.status(200).json(user);
    }).catch(error => console.log(error));
});
router.post('/auth/sign_up', (req, res) => {
    const newUser = req.body;
    user_repository.create(newUser)
        .then(user => res.status(200).json(user))
        .catch(error => console.log(error));
});

router.post('/auth/sign_up/check', (req, res) => {
    const username = req.body.username;
    user_repository.checkExist(username)
        .then(user_exist => {
            res.status(200).json(user_exist)
        })
        .catch(error => console.log(error));
});

router.post('/auth/sign_in', (req, res) => {
    const obj = req.body;
    user_repository.signIn(obj).then(user => {
        res.status(200).json(user);
    }).catch(error => console.log(error));
});

router.post('/auth/get_coin/:id', (req, res) => {
    const { id } = req.params;
    user_repository.getUser(id).then(user => {
        res.status(200).json(user.coin);
    }).catch(error => console.log(error));
});
router.put('/auth/update_coin/:id', (req, res) => {
    const { id } = req.params;
    const coin = req.body.coin;
    user_repository.updateCoin(id,coin).then(user => {
        res.status(200).json(user.name);
    }).catch(error => console.log(error));
});
router.put('/auth/plus_coin/:id', (req, res) => {
    const { id } = req.params;
    const coin = req.body.coin;
    user_repository.plusCoin(id,coin).then(user => {
        res.status(200).json(user);
    }).catch(error => console.log(error));
});
//-----------------------------------Season-----------------------------------------
router.get('/season/check_playing', (req, res) => {
    season_repository.findSeasonPlaying()
        .then(obj => {
            if(obj === null){
                season_repository.countDocument()
                    .then(obj => {
                        res.status(200).json(obj)
                    })
            }
            else
                res.status(200).json(obj)
        })
});

router.post('/season/check_last', (req, res) => {
    const season = req.body
    season_repository.findBySeason(season.season)
        .then(obj => {
            if(obj === null){
                season_repository.countDocument()
                    .then(obj => {
                        res.status(200).json(obj)
                    })
            }
            else{
                res.status(200).json(obj)
            }
        })
});
router.post('/season/create', (req, res) => {
    const obj = req.body;
    season_repository.create(obj).then(season => {
        res.status(200).json(season);
    }).catch(error => console.log(error));
});
router.post('/season/update', (req, res) => {
    const obj = req.body;
    season_repository.updateBySeason(obj).then(season => {
        res.status(200).json(season);
    }).catch(error => console.log(error));
});
//-----------------------------------Logs------------------------------------------
router.post('/log/create', (req, res) => {
    const obj = req.body;
    log_repository.create(obj).then(log => {
        res.status(200).json(log);
    }).catch(error => console.log(error));
});



module.exports = router