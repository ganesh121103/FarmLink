const mongoose = require('mongoose');

async function dropEmailIndex() {
  try {
    await mongoose.connect('mongodb+srv://pratik123:pratik123@cluster0.zbiymel.mongodb.net/test?appName=Cluster0');
    console.log('Connected to DB');
    
    // Drop the unique email_1 index
    const result = await mongoose.connection.collection('customers').dropIndex('email_1');
    console.log('Index dropped:', result);
    
  } catch (error) {
    if (error.codeName === 'IndexNotFound' || error.message.includes('index not found')) {
      console.log('Index already dropped or not found.');
    } else {
      console.error('Error dropping index:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

dropEmailIndex();
