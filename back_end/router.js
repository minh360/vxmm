const express = require("express");
const router = express.Router()
const user_repository = require('./repositories/user_repository')

router.post('/auth/sign_up', (req, res) => {
    const newUser = req.body;
    user_repository.create(newUser)
        .then(res.status(200).json([]))
        .catch((error) => console.log(error));
});

router.post('/auth/sign_up/check', (req, res) => {
    const obj = req.body;
    user_repository.checkExist(obj)
        .then(user_exist => {
            res.status(200).json(user_exist)
        })
        .catch((error) => console.log(error));
});

router.post('/auth/sign_in', (req, res) => {
    const obj = req.body;
    user_repository.signIn(obj).then((user) => {
        res.status(200).json(user);
    }).catch((error) => console.log(error));
});

router.post('/auth/get_coin/:id', (req, res) => {
    const { id } = req.params;
    user_repository.getCoin(id).then((user) => {
        res.status(200).json(user.coin);
    }).catch((error) => console.log(error));
});

module.exports = router