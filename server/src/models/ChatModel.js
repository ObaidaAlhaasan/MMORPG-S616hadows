import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatSchema = new Schema({
  email: {
    type: String,
    required: true,
    unqiue: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const ChatModel = mongoose.model('chat', ChatSchema);

export default ChatModel;
