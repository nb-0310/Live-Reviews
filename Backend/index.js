const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const cors = require('cors')
const connection = require('./db')

const { Review, connectToMongoDB } = require('./Models/Review')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, { cors: { origin: '*' } })

const PORT = process.env.PORT || 4000

connectToMongoDB().then(() => {
  app.use(cors())
  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({
      message: 'Service OK',
    })
  })

  app.get('/reviews', async (req, res) => {
    try {
      const reviews = await Review.find();
      console.log('reviews got')
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/reviews', async (req, res) => {
    try {
      const newReview = new Review(req.body);
      console.log('trying to post')
      await newReview.save()
        .then(savedReview => {
          console.log('Review saved:', savedReview);
        })
        .catch(error => {
          console.error('Error saving review:', error);
        });
      io.emit('new_review', newReview);
      res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const updatedReview = await Review.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.status(200).json({ message: 'Review updated successfully' });
      io.emit('review_updated', updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    console.log('trying to delete', id)
    try {
      const deletedReview = await Review.findByIdAndDelete(id);
      if (!deletedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.status(200).json({ message: 'Review deleted successfully' });
      io.emit('review_deleted', deletedReview);
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("chat_message", (msg) => {
      console.log("Message: " + msg);
      io.emit("chat_message", msg);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
