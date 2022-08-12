import axios from "axios";
export async function getUserName (idUser) {
    return await axios.request({
        method: "GET",
        url: "http://localhost:3000/auth/" + idUser,
        headers: {
            'Authorization': 'token'
        },
        timeout: 1000
    })
}
export async function updateCoin (idUser) {
    return await axios.request({
        method: "POST",
        url: "http://localhost:3000/auth/get_coin/" + idUser,
        headers: {
            'Authorization': 'token'
        },
        timeout: 1000
    })
}
export async function signIn (userName,password) {
    return await axios.request({
        method: "POST",
        url: "http://localhost:3000/auth/sign_in",
        headers: {
            'Authorization': 'token'
        },
        data: {
            userName: userName,
            password: password
        },
        timeout: 1000
    })
}
export async function checkExist (userName,password) {
    return await axios.request({
        method: "POST",
        url: "http://localhost:3000/auth/sign_up/check",
        headers: {
            'Authorization': 'token'
        },
        data: {
            userName: userName,
            password: password
        },
        timeout: 1000
    })
}
export function addNewAccount (userName,password) {
    return axios.request({
        method: "POST",
        url: "http://localhost:3000/auth/sign_up",
        headers: {
            'Authorization': 'token'
        },
        data: {
            userName: userName,
            password: password
        },
        timeout: 1000
    })
}
export async function checkSeasonPlaying () {
    return await axios.request({
        method: "GET",
        url: "http://localhost:3000/season/checking",
        headers: {
            'Authorization': 'token'
        }
    })
}
export async function joinSeason (data) {
    await axios.request({
        method: "POST",
        url: "http://localhost:3000/log/join",
        headers: {
            'Authorization': 'token'
        },
        data: data,
        timeout: 1000
    })
    return axios.request({
        method: "PUT",
        url: "http://localhost:3000/auth/update/" + data.idUser,
        headers: {
            'Authorization': 'token'
        },
        data: {coin: data.coinAfter},
        timeout: 1000
    })
}