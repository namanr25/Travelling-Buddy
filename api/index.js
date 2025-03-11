const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./Models/User.js');
const Place = require('./Models/Place.js');
const Booking = require('./Models/Booking.js');
const Review = require('./Models/Review.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
// const jwtSecret = 'bsbvdsvnonsvnslvbsdlvsn';
const jwtSecret = process.env.JWT_SECRET;
const ADMIN_EMAILS = ["namanrst@gmail.com", "harshvs@gmail.com"];

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/Uploads'));
app.use(cors({
    credentials: true,
    origin: 'https://travelling-buddy-frontend.onrender.com',
}));

mongoose.connect(process.env.MONGO_URL);

const getUserDataFromReq = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("No token provided in request headers.");
            return null;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token successfully verified:", decoded);
        return decoded; // Should return { id, email, ... }
    } catch (err) {
        console.error("Error verifying token:", err);
        return null;
    }
};


app.get('/test', (req, res) => {
    res.json('test ok');
});

//REGISTER
app.post('/register', async (req, res) => {
    const { name, email, password, phone, addressLine1, addressLine2, addressLine3, profession, age, socialMediaID } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const userDoc = await User.create({
            name, email, password: hashedPassword, phone,
            addressLine1, addressLine2, addressLine3,
            profession, age, socialMediaID
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

//LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const userDoc = await User.findOne({ email });

        if (!userDoc) return res.status(404).json({ error: "User not found" });

        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (!passOk) return res.status(422).json({ error: "Incorrect password" });

        //Sign the JWT
        const token = jwt.sign(
            { email: userDoc.email, id: userDoc._id },
            process.env.JWT_SECRET, // Ensure this is properly set
            { expiresIn: "1d" }
        );

        console.log("Token generated:", token); //Debugging log

        //Return token in response instead of a cookie
        res.json({ user: userDoc, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//USER PROFILE
app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.json(null);

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const { name, email, _id } = await User.findById(userData.id);
        res.json({ name, email, _id });
    });
});

// Personality Test Submission Endpoint
app.post('/submit-personality-test', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const { responses } = req.body;
        
        if (!responses || responses.length !== 25) {
            return res.status(400).json({ error: "Invalid responses. Must have 25 values." });
        }
        const extraversion = responses.slice(0, 5).reduce((a, b) => a + b, 0);
        const neuroticism = responses.slice(5, 10).reduce((a, b) => a + b, 0);
        const agreeableness = responses.slice(10, 15).reduce((a, b) => a + b, 0);
        const conscientiousness = responses.slice(15, 20).reduce((a, b) => a + b, 0);
        const openness = responses.slice(20, 25).reduce((a, b) => a + b, 0);
        const categories = {
            "Strategic Leader": (0.5 * conscientiousness) + (0.3 * extraversion) + (0.2 * (25 - neuroticism)),
            "Expressive Connector": (0.5 * extraversion) + (0.3 * agreeableness) + (0.2 * openness),
            "Independent Thinker": (0.5 * openness) + (0.3 * conscientiousness) + (0.2 * (25 - extraversion)),
            "Resilient Caregiver": (0.5 * agreeableness) + (0.3 * neuroticism) + (0.2 * conscientiousness),
            "Tactical Realist": (0.5 * conscientiousness) + (0.3 * (25 - agreeableness)) + (0.2 * neuroticism)
        };
        const personalityCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
        await User.findByIdAndUpdate(userData.id, {
            personalityCategory,
            personalityScores: { extraversion, neuroticism, agreeableness, conscientiousness, openness }
        });
        
        res.json({ message: "Personality test submitted successfully!", personalityCategory });
    } catch (err) {
        console.error("Error in submitting personality test:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

//FETCH USER INFO BY EMAIL
app.get('/user-info/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email }).select("name email age profession addressLine1 addressLine2 addressLine3 socialMediaID personalityCategory personalityScores");
        
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Error fetching user info:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

//LOGOUT
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

//UPLOAD PHOTOS
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

//CREATE PLACE
app.post('/places', async (req, res) => {
    const { token } = req.cookies;
    const { title, locationsToVisit, addedPhotos, description, priceToOutput, perks, extraInfo, itinerary } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        try {
            const placeDoc = await Place.create({
                title, locationsToVisit, photos: addedPhotos,
                description, perks, extraInfo,
                priceToOutput, basePrice: priceToOutput.economy,
                itinerary
            });

            console.log("New Place Created - ID:", placeDoc._id);
            res.json(placeDoc);
        } catch (error) {
            res.status(500).json({ error: "Error creating place", details: error.message });
        }
    });
});

//UPDATE PLACE
app.put('/places/:id', async (req, res) => {
    try {
        const placeId = req.params.id;
        const updatedData = req.body;

        const updatedPlace = await Place.findByIdAndUpdate(placeId, updatedData, { new: true });

        if (!updatedPlace) {
            return res.status(404).json({ error: "Place not found" });
        }

        res.json(updatedPlace);
    } catch (err) {
        res.status(500).json({ error: "Error updating place", details: err.message });
    }
});

app.get('/places/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ error: "Place not found" });

        res.json(place);
    } catch (err) {
        res.status(500).json({ error: "Error fetching place", details: err.message });
    }
});

//FETCH ALL PLACES
app.get('/places', async (req, res) => {
    res.json(await Place.find());
});

//FETCH PLACE BY ID
app.get('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'users',
            select: 'name email'
        }).populate({
            path: 'place',
            select: 'title locationsToVisit photos description priceToOutput itinerary'
        });

        if (!booking) return res.status(404).json({ error: "Booking not found." });

        res.json(booking);
    } catch (err) {
        console.error("Error fetching booking:", err);
        res.status(500).json({ error: "Error fetching booking", details: err.message });
    }
});

//BOOKING A PLACE
app.post('/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !user.personalityCategory) {
            return res.status(400).json({ error: "You must complete the personality test before booking." });
        }

        const { place, checkIn, priceSelectedByUser } = req.body;
        
        if (!place || !checkIn || !priceSelectedByUser) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const foundPlace = await Place.findById(place);
        if (!foundPlace) {
            return res.status(404).json({ error: "Place not found." });
        }

        const checkInDate = new Date(checkIn);
        checkInDate.setHours(0, 0, 0, 0);

        let existingBookings = await Booking.find({
            place: foundPlace._id,
            priceSelectedByUser: Number(priceSelectedByUser),
            checkIn: { 
                $gte: checkInDate, 
                $lt: new Date(checkInDate.getTime() + 86400000) // Adds 1 day
            }
        }).populate('users');

        let selectedBooking = null;
        
        for (let booking of existingBookings) {
            const personalityCount = booking.users.filter(u => u.personalityCategory === user.personalityCategory).length;
            if (booking.users.length < 10 && personalityCount < 2) {
                selectedBooking = booking;
                break;
            }
        }

        if (selectedBooking) {
            selectedBooking.users.push(user._id);
            await selectedBooking.save();
            return res.json({ message: "You have been added to an existing booking.", bookingId: selectedBooking._id });
        }

        const newBooking = await Booking.create({
            place: foundPlace._id,
            users: [user._id],
            checkIn: checkInDate,
            priceSelectedByUser: Number(priceSelectedByUser)
        });

        return res.json({ message: "New booking created successfully!", bookingId: newBooking._id });
    } catch (err) {
        console.error("Error in booking:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

//FETCH BOOKINGS
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



//Admin Check API Route
app.get('/is-admin', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.json({ isAdmin: false });
        }

        res.json({ isAdmin: true });
    } catch (err) {
        console.error("Error checking admin status:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});


// Admin route: Fetch all users
app.get('/admin/users', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        const users = await User.find().select("name email personalityCategory bookingIds");
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Delete a user
app.delete('/admin/users/:id', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Reset personality test
app.put('/admin/users/:id/reset-personality', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        await User.findByIdAndUpdate(req.params.id, {
            personalityCategory: null,
            personalityScores: {
                extraversion: null,
                neuroticism: null,
                agreeableness: null,
                conscientiousness: null,
                openness: null
            }
        });
        
        res.json({ message: "User's personality test has been reset." });
    } catch (err) {
        console.error("Error resetting personality test:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Fetch all bookings
app.get('/admin/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        const bookings = await Booking.find()
            .populate({ path: 'users', select: 'name email personalityCategory' })
            .populate({ path: 'place', select: 'title' });
        
        res.json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Delete a booking
app.delete('/admin/bookings/:id', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted successfully." });
    } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Fetch all places
app.get('/admin/places', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        const places = await Place.find();
        res.json(places);
    } catch (err) {
        console.error("Error fetching places:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Delete a place
app.delete('/admin/places/:id', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        await Place.findByIdAndDelete(req.params.id);
        res.json({ message: "Place deleted successfully." });
    } catch (err) {
        console.error("Error deleting place:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Update a place
app.put('/admin/places/:id', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPlace);
    } catch (err) {
        console.error("Error updating place:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Admin route: Add a new place
app.post('/admin/places', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const user = await User.findById(userData.id);
        
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        const newPlace = await Place.create(req.body);
        res.json(newPlace);
    } catch (err) {
        console.error("Error creating place:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.post('/places/:placeId/reviews', async (req, res) => {
    const { placeId } = req.params;
    const { userId, rating, reviewText } = req.body;

    console.log("Received Review Request:", { placeId, userId, rating, reviewText });

    try {
        if (!userId || !rating || !reviewText) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const booking = await Booking.findOne({ place: placeId, users: userId });
        if (!booking) {
            console.error("No valid booking found for this user at this place.");
            return res.status(403).json({ error: "You can only review places after completing the trip." });
        }

        const existingReview = await Review.findOne({ placeId, userId });
        if (existingReview) {
            console.error("User has already submitted a review for this place.");
            return res.status(409).json({ error: "You have already reviewed this place." });
        }

        const review = new Review({ userId, placeId, rating, reviewText });
        await review.save();

        res.json({ message: "Review added successfully", review });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET: Fetch all reviews for a place
app.get('/places/:placeId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ placeId: req.params.placeId })
            .populate("userId", "name"); 

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reviews" });
    }
});

// PUT: Edit a review (only by the original user)
app.put('/places/:placeId/reviews/:reviewId', async (req, res) => {
    const { placeId, reviewId } = req.params;
    const { userId, rating, reviewText } = req.body;

    console.log("Received Edit Review Request:", { placeId, reviewId, userId, rating, reviewText });

    try {
        const review = await Review.findOne({ _id: reviewId, userId, placeId });
        if (!review) {
            console.error("Review not found!");
            return res.status(404).json({ error: "Review not found" });
        }

        review.rating = rating;
        review.reviewText = reviewText;
        await review.save();

        res.json({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Error updating review" });
    }
});

// DELETE: Delete a review (by the original user or admin)
app.delete('/places/:placeId/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;

    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: "Review not found" });

        const user = await User.findById(userId);
        const isAdmin = user && ADMIN_EMAILS.includes(user.email);
        
        if (review.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ error: "You can only delete your own review" });
        }

        await review.deleteOne();
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting review" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});