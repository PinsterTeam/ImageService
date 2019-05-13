const ImageUploader = require('./lib/image-uploader');
const StepFunctions = require('./lib/step-functions');
const Moderator = require('./lib/moderator');
const Notifier = require('./lib/notifier');
const ThumbnailGenerator = require('./lib/thumbnail-generator');
const ImageMover = require('./lib/image-mover');

module.exports.upload = async (event, context, callback) => {
    const imageUploader = new ImageUploader();
    return await imageUploader.perform(event, callback);
};

module.exports.startExecution = (event, context, callback) => {
    const stepFunctions = new StepFunctions();
    return stepFunctions.perform(event, callback);
};

module.exports.generateThumbnail = (event, context, callback) => {
    const thumbnailGenerator = new ThumbnailGenerator();
    return thumbnailGenerator.generate(event, callback);
};

module.exports.moderate = (event, context, callback) => {
    const moderator = new Moderator();
    return moderator.moderate(event, callback);
};

module.exports.notifySuccess = async (event, context, callback) => {
    const notifier = new Notifier();
    return await notifier.notifySuccess(event, callback);
};

module.exports.notifyFailure = async (event, context, callback) => {
    const notifier = new Notifier();
    return await notifier.notifyFailure(event, callback);
};

module.exports.moveImage = (event, context, callback) => {
    const imageMover = new ImageMover();
    return imageMover.moveImage(event, callback);
};