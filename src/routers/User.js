const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.js');
require('../db/mongoose.js')
const { ObjectID } = require('mongodb');
const auth = require('../middleware/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const account = require('../emails/account.js');

const router = new express.Router();

const avatar = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('file must be of image format'));
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth ,avatar.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send('stored your current avatar');
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
});

router.delete('/users/me/avatar', auth, async (req,res)=>{
    if(req.user.avatar === undefined)
    {return res.status(404).send('you do not have any uploaded profile pic')}
    req.user.avatar = undefined;
    await req.user.save();
    res.send('your profile pic deleted successfully!!')
})

router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user||!user.avatar){
            throw new Error();
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
})

router.post('/users', async (req,res)=>{
    const user = new User(req.body);
    account.sendWelcomeMail(user.email,user.name);
    try{
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }  
})

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({user , token});
    } catch (error) {
        res.status(400).send();
    }
})

router.post('/users/logout', auth ,async (req,res)=>{
try {
    req.user.tokens = req.user.tokens.filter((token)=>{
        return token.token != req.token;
    })
    await req.user.save();
    res.send();
} catch (e) {
    res.status(500).send();
}
});

router.post('/users/logoutAll', auth , async (req,res)=>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/users/me', auth , async (req,res)=>{
    res.send(req.user);
});

router.patch('/users/me', auth , async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValid = updates.every((update)=>{
    return allowedUpdates.includes(update) 
    })
    if(!isValid)
    {res.status(400).send({error : "Invalid Updates!!"})}
    try {
    updates.forEach((update)=>{
        req.user[update] = req.body[update]
    })
    await req.user.save();
    res.status(200).send(req.user);
    }catch (error) {
    res.status(500).send(error);
}
});

router.delete('/users/me', auth , async (req,res)=>{
    try {
        account.sendLeavingMail(req.user.email,req.user.name);
        await req.user.remove()
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;