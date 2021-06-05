const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const PWAPosts = mongoose.model("PWAPosts");

router.get('/pwa-posts', async (req, res) => {
    PWAPosts.find({})
        .then((posts) => {
            if (!posts) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            res.json(posts);
        })
        .catch((err) => { res.status(422).json({ error: "Something went wrong, Please try again later." }); });
});

router.post('/pwa-posts', async (req, res) => {
    const Post = new PWAPosts({
        image: req.body.image,
        title: req.body.title,
        location: req.body.location
    });

    Post.save()
        .then((result) => {
            if (!result) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            res.json({ post: result });
        })
        .catch((err) => { console.log(err) });
});

module.exports = router;