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
        .then(res.status(200).json([]))
        .catch(error => console.log(error));
});

router.post('/auth/sign_up/check', (req, res) => {
    const obj = req.body;
    user_repository.checkExist(obj)
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
    user_repository.getCoin(id).then(user => {
        res.status(200).json(user.coin);
    }).catch(error => console.log(error));
});
router.put('/auth/update/:id', (req, res) => {
    const { id } = req.params;
    const coin = req.body.coin;
    user_repository.updateCoin(id,coin).then(user => {
        res.status(200).json(user.name);
    }).catch(error => console.log(error));
});
//-----------------------------------Season-----------------------------------------
router.get('/season/checking', (req, res) => {
    season_repository.findSeasonPlaying()
        .then(obj => {
            if(obj === null){
                season_repository.countDocument()
                    .then(obj => {
                        console.log(obj)
                        res.status(200).json(obj)
                    })
            }
            else
                res.status(200).json(obj)
        })
});
router.post('/season/create', (req, res) => {
    const obj = req.body;
    const data = {
        timeBegin: obj.time,
        listJoin: obj.listJoin,
        coinWin: obj.coin,
        nameWin: obj.name
    }
    season_repository.create(data).then(season => {
        res.status(200).json(season);
    }).catch(error => console.log(error));
});
//-----------------------------------Logs------------------------------------------
router.post('/log/join', (req, res) => {
    const obj = req.body;
    log_repository.create(obj).then(log => {
        res.status(200).json(log);
    }).catch(error => console.log(error));
});



module.exports = router