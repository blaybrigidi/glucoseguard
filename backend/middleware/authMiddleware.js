const { admin } = require('../config/firebase');

// Guard for protected routes — the frontend sends a Firebase token in the
// Authorization header, and we verify it's real before letting the request through.
// If it checks out, we attach the user's ID and email to the request object
// so any route handler further down the chain can use it.
const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorised, no token' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorised, invalid token' });
    }
};

module.exports = { protect };
