// import { Context } from "hono";
// import { asyncHandler } from "@utils/asynchandler";
// import express from "express";
// import url from "url";

// const authHandler = (async (req, res) => {
//     const {code} = req.query;

//     if(code){
//         const formData = new url.URLSearchParams({
//             client_id : process.env.DISCORD_CLIENT_ID,
//             client_secret : process.env.DISCORD_CLIENT_SECRET,
//             grant_type : 'authorization_code',
//             code: code.toString(),
//             redirect_url : process.env.DISCORD_CALLBACK_URL
//         });

//         const output = await fetch('https://discord.com/api/v10/oauth2/token', {
//             method: 'POST',
//             headers: {
//                 'Content-Type' : 'application/x-www-form-urlencoded',
//             },
//             body: formData
//         });

//         if(output.data){
//             const token = output.data.access_token;

//             const user_info = await fetch('ttps://discord.com/api/v10/users/@me', {
//                 method: "GET",
//                 headers: {
//                     "Authorization" : `Bearer ${token}`
//                 }
//             });

//             console.log(output.data, user_info.data)
//         }
//     }
// });
