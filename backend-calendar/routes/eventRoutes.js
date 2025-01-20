const express = require('express');
const { createEvent, getEvents , updateEvent,deleteEvent} = require('../controllers/eventController');

const router = express.Router();

router.post('/createevent' , createEvent);
router.get('/getevent', getEvents);
router.put('/updateevent', updateEvent);
router.delete('/deleteevent', deleteEvent);

module.exports = router;
