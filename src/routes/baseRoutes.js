const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('QNG Monitor!');
});

module.exports = router;
