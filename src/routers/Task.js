const express = require('express');
const auth = require('../middleware/auth.js')
const mongoose = require('mongoose');
const Tasks = require('../models/tasks.js');
require('../db/mongoose.js')
const { ObjectID } = require('mongodb');

const router = new express.Router();

router.post('/tasks',auth, async (req,res)=>{
    const task = new Tasks({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.get('/tasks',auth, async (req,res)=>{
    try {
       const match = {};
       const sortquery ={};
       if(req.query.sortBy)
       {
           const parts = req.query.sortBy.split(':');
           sortquery[parts[0]] = parts[1] === 'desc'? -1:1;
       }
       if(req.query.completed){
           match.completed = req.query.completed === 'true';
       }
       if(typeof match.completed !== "undefined") {
        const task = await Tasks.find({owner: req.user._id, completed: match.completed}).limit(parseInt(req.query.limit)
        ||1000).skip(parseInt(req.query.skip)||0).sort(sortquery);
        res.status(200).send(task);
        }
    const task = await Tasks.find({owner: req.user._id}).limit(parseInt(req.query.limit)
    ||1000).skip(parseInt(req.query.skip)||0).sort(sortquery);
    res.status(200).send(task);
    } catch (error) {
        res.status(500).send();
    } 
});
    
router.get('/tasks/:id',auth, async (req,res)=>{
    const _id=req.params.id;
     try {
        const task = await Tasks.findOne({_id, owner:req.user._id})
        if(!task)
        {return res.status(404).send();}
         res.status(200).send(task);
     } catch (error) {
         res.status(400).send();
     }
});

router.patch('/tasks/:id',auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed']; 
    const isValid = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValid)
    {res.status(400).send({error : "Invalid Updates!!"})}

try {
    const task = await Tasks.findOne({_id:req.params.id, owner:req.user._id})
    if(!task)
    { return res.status(404).send();}
    updates.forEach((update)=>{
        task[update] = req.body[update]
    });
    await task.save();
    res.status(200).send(task);
} catch (error) {
    res.status(500).send(error);
}
});

router.delete('/tasks/:id',auth, async (req,res)=>{
    try {
        const task = await Tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if(!task)
        {return res.status(404).send();}
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;