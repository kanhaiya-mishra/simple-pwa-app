const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const PWAPost = mongoose.model("PWAPost");
const Subscription = mongoose.model("Subscription");
const webpush = require('web-push');
const formidable = require('formidable');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'kanhaiya-insta-clone',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/pwa-posts', async (req, res) => {
    PWAPost.find({})
        .then((posts) => {
            if (!posts) return res.status(422).json({ error: "Something went wrong, Please try again later." });
            res.json(posts);
        })
        .catch((err) => { res.status(422).json({ error: "Something went wrong, Please try again later." }); });
});

router.post('/pwa-posts', async (req, res) => {
    const formData = new formidable.IncomingForm();
    formData.parse(req, function (err, fields, files) {
        return cloudinary.uploader.upload(files.file.path, function (result, error) {
            if (error) {
                return res.status(422).json({ error: "Something went wrong, Please try again later." });
            }
            const Post = new PWAPost({
                id: fields.id,
                image: result.url,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                    lat: fields.rawLocationLat,
                    lng: fields.rawLocationLng
                }
            });
            let savedPost;

            return Post.save()
                .then((result) => {
                    if (!result) return res.status(422).json({ error: "Something went wrong, Please try again later." });
                    savedPost = result;
                    webpush.setVapidDetails('mailto:starklm1402@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
                    return Subscription.find();
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
                .catch((err) => {
                    console.log(err);
                    res.status(422).json({ error: "Something went wrong, Please try again later." });
                });
        });
    });
});

// router.get('/subscriptions', async (req, res) => {
//     Subscription.find()
//         .then((result) => {
//             if (!result) return res.status(422).json({ error: "Something went wrong, Please try again later." });
//             res.json(result);
//         })
//         .catch((err) => { res.status(422).json({ error: "Something went wrong, Please try again later." }); });
// });

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