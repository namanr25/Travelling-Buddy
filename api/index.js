const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./Models/User.js');
const Place = require('./Models/Place.js');
const Booking = require('./Models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'bsbvdsvnonsvnslvbsdlvsn';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/Uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) reject(err);
            resolve(userData);
        });
    });
}

app.get('/test', (req, res) => {
    res.json('test ok');
});

// 🟢 REGISTER
app.post('/register', async (req, res) => {
    const { name, email, password, phone, addressLine1, addressLine2, addressLine3, profession, age, socialMediaID } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const userDoc = await User.create({
            name, email, password: hashedPassword, phone,
            addressLine1, addressLine2, addressLine3,
            profession, age, socialMediaID
        });
        console.log("✅ New User Registered - ID:", userDoc._id);
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

// 🟢 LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });

    if (!userDoc) return res.status(404).json('User not found');

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            }).json(userDoc);
        });
    } else {
        res.status(422).json('Incorrect password');
    }
});

// 🟢 USER PROFILE
app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.json(null);

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const { name, email, _id } = await User.findById(userData.id);
        res.json({ name, email, _id });
    });
});

// 🟢 FETCH USER INFO BY EMAIL
app.get('/user-info/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // ✅ Fetch socialMediaID along with other user details
        const user = await User.findOne({ email }).select("name email age profession addressLine1 addressLine2 addressLine3 socialMediaID");

        if (!user) return res.status(404).json({ error: "User not found" });

        // console.log("✅ API Response:", user); // Debugging log
        res.json(user);
    } catch (err) {
        console.error("❌ Error fetching user info:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// 🟢 LOGOUT
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

// 🟢 UPLOAD PHOTOS
const photosMiddleware = multer({ dest: 'Uploads/' });
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadedFiles = [];
    for (let file of req.files) {
        const ext = file.originalname.split('.').pop();
        const newPath = file.path + '.' + ext;
        fs.renameSync(file.path, newPath);
        uploadedFiles.push(newPath.replace('Uploads\\', ''));
    }
    res.json(uploadedFiles);
});

// 🟢 CREATE PLACE
app.post('/places', async (req, res) => {
    const { token } = req.cookies;
    const { title, locationsToVisit, addedPhotos, description, priceToOutput, perks, extraInfo } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        try {
            const placeDoc = await Place.create({
                title, locationsToVisit, photos: addedPhotos,
                description, perks, extraInfo,
                priceToOutput, basePrice: priceToOutput.economy
            });

            console.log("✅ New Place Created - ID:", placeDoc._id);
            res.json(placeDoc);
        } catch (error) {
            res.status(500).json({ error: "Error creating place", details: error.message });
        }
    });
});

// 🟢 FETCH ALL PLACES
app.get('/places', async (req, res) => {
    res.json(await Place.find());
});

// 🟢 FETCH PLACE BY ID
app.get('/places/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ error: "Place not found" });

        // console.log("✅ Place Found - ID:", place._id);
        res.json(place);
    } catch (err) {
        res.status(500).json({ error: "Error fetching place", details: err.message });
    }
});

// 🟢 BOOKING A PLACE
app.post('/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const { place, checkIn, priceSelectedByUser } = req.body;

        if (!place || !checkIn || !priceSelectedByUser) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const foundPlace = await Place.findById(place);
        if (!foundPlace) {
            return res.status(404).json({ error: "Place not found." });
        }

        const allBookings = await Booking.find({ place: foundPlace._id });
        // console.log("📌 All bookings for this place:", allBookings);

        const checkInDate = new Date(checkIn);
        checkInDate.setHours(0, 0, 0, 0);

        const existingBooking = await Booking.findOne({
            place: foundPlace._id,
            priceSelectedByUser: Number(priceSelectedByUser),
            checkIn: { 
                $gte: checkInDate, 
                $lt: new Date(checkInDate.getTime() + 86400000) // Adds 1 day
            }
        });

        console.log("🔍 Checking for existing booking:", { 
            place: foundPlace._id, 
            checkIn: checkInDate, 
            priceSelectedByUser: Number(priceSelectedByUser) 
        });
        console.log("⚠️ Existing booking found?", existingBooking);

        if (existingBooking) {
            const isUserAlreadyBooked = existingBooking.users.includes(userData.id);

            if (isUserAlreadyBooked) {
                return res.status(409).json({ 
                    error: "You have already booked this trip.", 
                    bookingId: existingBooking._id 
                });
            }

            // 🟢 Step 6: If user is not in the booking, add them
            existingBooking.users.push(userData.id);
            await existingBooking.save();

            return res.json({ 
                message: "You have been added to the existing booking.", 
                bookingId: existingBooking._id 
            });
        }

        // 🟢 Step 7: If no existing booking, create a new one
        const newBooking = await Booking.create({
            place: foundPlace._id,
            users: [userData.id], 
            checkIn: checkInDate,
            priceSelectedByUser: Number(priceSelectedByUser)
        });

        return res.json({ 
            message: "Booking created successfully!", 
            bookingId: newBooking._id 
        });

    } catch (err) {
        console.error("❌ Error in booking:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// app.post('/bookings', async (req, res) => {
//     try {
//         console.log('Booking request body:', req.body);  // Log the incoming request body
        
//         const userData = await getUserDataFromReq(req);
//         const { place, checkIn, priceSelectedByUser } = req.body;

//         // Validate required fields
//         if (!place || !checkIn || !priceSelectedByUser) {
//             return res.status(400).json({ error: "Missing required fields." });
//         }
        
//         // Continue processing...
//     } catch (err) {
//         console.error("Error in booking:", err);
//         res.status(500).json({ error: "Internal Server Error", details: err.message });
//     }
// });

// 🟢 FETCH BOOKINGS
app.get('/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        if (!userData) return res.status(401).json({ error: "Unauthorized" });

        const bookings = await Booking.find({ users: userData.id })
            .populate({ path: 'users', select: 'name email phone' })
            .populate({ path: 'place', select: 'title basePrice priceToOutput' });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.get('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'users',
            select: 'name email'
        }).populate({
            path: 'place',
            select: 'title locationsToVisit photos description priceToOutput'
        });

        if (!booking) return res.status(404).json({ error: "Booking not found." });

        res.json(booking);
    } catch (err) {
        console.error("Error fetching booking:", err);
        res.status(500).json({ error: "Error fetching booking", details: err.message });
    }
});

app.listen(4000, () => console.log("🚀 Server running on port 4000"));