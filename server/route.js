const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const PWAPosts = mongoose.model("PWAPosts");
const Subscription = mongoose.model("Subscription");
const webpush = require('web-push');

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
    let savedPost;

    Post.save()
        .then((result) => {
            if (!result) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            savedPost = result;
            webpush.setVapidDetails('mailto:starklm1402@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
            return Subscription.find({});
        })
        .then((subscriptions) => {
            subscriptions.forEach((sub) => {
                let pushConfig = {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.keys.auth,
                        p256dh: sub.keys.p256dh,
                    }
                }
                webpush.sendNotification(pushConfig, JSON.stringify({
                    title: 'New Post',
                    content: 'New Post added!!',
                    openURL: '/'
                }));
            });
            return res.json({ post: savedPost });
        })
        .catch((err) => { res.status(422).json({ error: "Something went wrong, Please try again later." }); });
});

router.get('/subscriptions', async (req, res) => {
    Subscription.find({})
        .then((posts) => {
            if (!posts) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            res.json(posts);
        })
        .catch((err) => { res.status(422).json({ error: "Something went wrong, Please try again later." }); });
});

router.post('/subscription', async (req, res) => {
    const subscription = new Subscription(req.body);

    subscription.save()
        .then((result) => {
            if (!result) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            res.json(result);
        })
        .catch((err) => { console.log(err) });
});

module.exports = router;