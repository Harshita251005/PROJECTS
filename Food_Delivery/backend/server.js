// import express from 'express'
// import cors from 'cors'
// import { connectDB } from './config/db.js'
// import foodRouter from './routes/foodRoute.js'
// import userRouter from './routes/userRoute.js';
// import 'dotenv/config';
// import cartRouter from './routes/cartRoute.js';
// import orderRouter from './routes/orderRoute.js';

// //app config
// const app = express()
// const port = 5000

// // middleware
// app.use(express.json())
// app.use(cors())

// //db connection
// connectDB();

// // api endpoints
// app.use("/api/food",foodRouter)
// app.use("/images",express.static('uploads'))
// app.use('/api/user', userRouter)
// app.use('/api/cart', cartRouter)
// app.use('/api/order', orderRouter)

// app.get("/",(req,res)=>{
//         res.send("API working")
// })

// app.listen(port,()=>{
//     console.log(`Server started on http://localhost:${port}`)
// })

// //mongodb+srv://dulanjalisenarathna93:E2JUb0zfaT2FVp8D@cluster0.exkxkun.mongodb.net/?


import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js';
import 'dotenv/config';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import http from 'http';
import { Server } from 'socket.io';

//app config
const app = express()
const port = 5000

// middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use('/api/user', userRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get("/", (req, res) => {
  res.send("API working")
})

// Create HTTP server and attach Socket.io
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"]
  }
})

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // When client joins specific order room
  socket.on("join_order", (orderId) => {
    socket.join(orderId)
    console.log(`User joined order room: ${orderId}`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Function to emit updates
export const sendOrderUpdate = (orderId, status) => {
  io.to(orderId).emit("order_update", status)
}

// Start server
server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
