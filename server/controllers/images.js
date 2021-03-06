const imageController = {};
const aws = require('aws-sdk');
const Image = require('../models/image');
const Beacon = require('../models/beacon');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET || process.env.aws_secret_access_key,
    accessKeyId: process.env.AWS_ACCESS_KEY || process.env.aws_access_key_id,
    region: process.env.AWS_REGION || process.env.region
});
const s3 = new aws.S3();

// begin methods
imageController.getSingleImage = function(req, res) {
    Image.findById(req.params.id)
    .then(image => {
        if (image.created_by.toString() === req.locals.decoded.id) {
            var myBucket = 'beacons-images';
            var myKey = image.key;
            var signedUrlExpireSeconds = 60 * 20;

            var url = s3.getSignedUrl('getObject', {
                Bucket: myBucket,
                Key: myKey,
                Expires: signedUrlExpireSeconds
            });

            return res.status(200).json({
                'url': url,
                'description': image.description,
                'alt': image.alt,
            });
        } else {
            throw 'Couldn\'t get image.';
        }
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        });
    });
};

imageController.getImages = function(req, res) {
    var arr = JSON.parse(req.query.images);
    var len = arr.length;

    Image.find({ '_id': { $in: arr } })
    .then(image => {
        var images = [];

        for (let i = 0; i < len; i++) {
            if (image[i].created_by.toString() === req.locals.decoded.id) {
                let myBucket = 'beacons-images';
                let myKey = image[i].key;
                let signedUrlExpireSeconds = 60 * 20;

                let url = s3.getSignedUrl('getObject', {
                    Bucket: myBucket,
                    Key: myKey,
                    Expires: signedUrlExpireSeconds
                });

                images.push({
                    url: url,
                    description: image[i].description,
                    alt: image[i].alt,
                    id: image[i].id
                });
                continue;
            }
        }

        return res.status(200).json({
            images: images
        });
    })
    .catch(() => {
        return res.status(500).json({
            error: 'An unknown error occurred.'
        });
    });
};

imageController.uploadImage = function(req, res) {
    if (req.body && req.file) {
        Beacon.find({
            created_by: req.locals.decoded.id,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [req.body.longitude, req.body.latitude]
                    },
                    $maxDistance: 10
                }
            },
        })
        .limit(1)
        .then(beacons => {
            if (beacons.length > 0) {
                var newImage = new Image();
                newImage.description = req.body.description || '';
                newImage.alt = req.body.alt || '';
                newImage.beacon = beacons[0].id;
                newImage.created_by = req.locals.decoded.id;
                newImage.key = req.file.key;

                newImage.save()
                    .then(image => {
                        var theImage = {
                            image_id: image.id
                        };

                        beacons[0].images.push(theImage);

                        beacons[0].save()
                            .then(() => {
                                return res.status(200).json({
                                    'success': 'Image uploaded successfully!'
                                });
                            })
                            .catch(() => {
                                return res.status(500).json({
                                    'error': 'An unknown error occurred.'
                                });
                            });
                    });
            } else {
                var newBeacon = new Beacon();
                newBeacon.name =  req.body.beaconTitle || 'No Title Set';
                newBeacon.location.coordinates.push(req.body.longitude);
                newBeacon.location.coordinates.push(req.body.latitude);
                newBeacon.description = req.body.beaconDescription || 'No Description Set';
                newBeacon.created_by = req.locals.decoded.id;

                newBeacon.save()
                .then(beacon => {
                    var newImage = new Image();
                    newImage.description = req.body.description || '';
                    newImage.alt = req.body.description || '';
                    newImage.beacon = beacon.id;
                    newImage.created_by = req.locals.decoded.id;
                    newImage.key = req.file.key;

                    newImage.save()
                    .then(image => {
                        var theImage = {
                            image_id: image.id
                        };

                        beacon.images.push(theImage);

                        beacon.save()
                        .then(() => {
                            return res.status(200).json({
                                'success': 'Image uploaded successfully!'
                            });
                        })
                        .catch(() => {
                            return res.status(500).json({
                                'error': 'An unknown error occurred.'
                            });
                        });
                    })
                    .catch(() => {
                        return res.status(500).json({
                            'error': 'An unknown error occurred.'
                        });
                    });
                })
                .catch(() => {
                    return res.status(500).json({
                        'error': 'An unknown error occurred.'
                    });
                });
            }
        });
    } else {
        return res.status(500).json({
            error: 'No data was provided in request.'
        });
    }
};

imageController.deleteImage = function(req, res) {
    Image.findById(req.params.id)
    .then(image => {
        if (image.created_by.toString() === req.locals.decoded.id) {
            s3.deleteObject({
                Bucket: 'beacons-images',
                Key: image.key
            }, function (err) {
                if (err) {
                    return res.status(500).json({
                        'error': 'An unknown error occurred'
                    });
                } else {
                    var id = image.id;
                    var beaconId = image.beacon;
                    image.remove()
                    .then(() => {
                        return Beacon.update({ _id: beaconId}, { $pull: { 'images': { image_id: id }}}, { safe: true, multi: false });
                    })
                    .then(() => {
                        return res.status(200).json({
                            success: 'Image deleted successfully!'
                        });
                    })
                    .catch(() => {
                        return res.status(500).json({
                            error: 'Something unexpected happened.'
                        });
                    });
                }
            });
        }
    })
    .catch(() => {
        return res.status(500).json({
            'error': 'An unknown error occurred'
        });
    });
};

module.exports = imageController;