const axios = require('axios')
module.exports = {
    getUsername: async function getUsername (idUser) {
        return await axios.request({
            method: "GET",
            url: "http://localhost:3000/auth/" + idUser,
            headers: {
                'Authorization': 'token'
            },
            timeout: 1000
        })
    },
    getCoin: async function getCoin (idUser) {
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/auth/get_coin/" + idUser,
            headers: {
                'Authorization': 'token'
            },
            timeout: 1000
        })
    },
    checkExist: async function checkExist (username) {
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/auth/sign_up/check",
            headers: {
                'Authorization': 'token'
            },
            data: {username: username},
            timeout: 1000
        })
    },
    addNewAccount: function addNewAccount (username,password) {
        return axios.request({
            method: "POST",
            url: "http://localhost:3000/auth/sign_up",
            headers: {
                'Authorization': 'token'
            },
            data: {
                username: username,
                password: password
            },
            timeout: 1000
        })
    },
    checkSeasonPlaying: async function checkSeasonPlaying () {
        return await axios.request({
            method: "GET",
            url: "http://localhost:3000/season/check_playing",
            headers: {
                'Authorization': 'token'
            }
        })
    },
    checkLastSeason: async function checkLastSeason (season) {
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/season/check_last",
            headers: {
                'Authorization': 'token'
            },
            data: {season: season},
            timeout: 1000
        })
    },
    changeCoin: async function changeCoin(data){
        await axios.request({
            method: "PUT",
            url: "http://localhost:3000/auth/change_coin/" + data.id,
            headers: {
                'Authorization': 'token'
            },
            data: {coin: data.coin},
            timeout: 1000
        })
        const dataLog = {
            season: data.season,
            username: data.username,
            coinBefore: data.coinBefore,
            coinAfter: Number(data.coinBefore) + Number(data.coin),
            coinUsed: data.coin
        }
        return axios.request({
            method: "POST",
            url: "http://localhost:3000/log/create",
            headers: {
                'Authorization': 'token'
            },
            data: dataLog,
            timeout: 1000
        })
    },
    joinSeason: async function joinSeason (data) {
        await axios.request({
            method: "PUT",
            url: "http://localhost:3000/auth/change_coin/" + data.idUser,
            headers: {
                'Authorization': 'token'
            },
            data: {coin: Number(data.coinUsed)},
            timeout: 1000
        })
        return axios.request({
            method: "POST",
            url: "http://localhost:3000/log/create",
            headers: {
                'Authorization': 'token'
            },
            data: data,
            timeout: 1000
        })
    },
    createSeason: async function createSeason (data) {
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/season/create",
            headers: {
                'Authorization': 'token'
            },
            data: data,
            timeout: 1000
        })
    },
    updateSeason: async function updateSeason (data){
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/season/update",
            headers: {
                'Authorization': 'token'
            },
            data: data,
            timeout: 1000
        })
    },
    getLogs: async function getLogs (username){
        return await axios.request({
            method: "POST",
            url: "http://localhost:3000/log/get",
            headers: {
                'Authorization': 'token'
            },
            data: {username: username},
            timeout: 1000
        })
    }
}