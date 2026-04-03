const { admin } = require('../config/firebase');

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
