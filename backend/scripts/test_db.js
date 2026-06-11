const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb+srv://pratik123:pratik123@cluster0.zbiymel.mongodb.net/farmlink?appName=Cluster0')
  .then(async () => {
    const storyId = '6a13567530d08282d59acbfc';
    const userId = '6a0ae5a83686ceefa4183f54'; // admin _id

    let story = await Story.findOneAndUpdate(
      { _id: storyId, likedBy: { $ne: userId } },
      { $push: { likedBy: userId }, $inc: { likes: 1 } },
      { new: true }
    );
    
    console.log('Story after like:', story ? story.likedBy : 'null');
    
    let story2 = await Story.findOneAndUpdate(
      { _id: storyId, likedBy: userId },
      { $pull: { likedBy: userId }, $inc: { likes: -1 } },
      { new: true }
    );
    
    console.log('Story after unlike:', story2 ? story2.likedBy : 'null');
    
    process.exit(0);
  });
