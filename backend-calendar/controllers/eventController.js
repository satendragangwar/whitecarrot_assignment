const { google } = require("googleapis");
const User = require("../models/User");




const createEvent = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const user = await User.findOne({ accessToken: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ access_token: token });
  
    const { summary, startDate, startTime, endDate, endTime, description, location } = req.body;
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

   
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    if (startDateTime < new Date()) {
      return res.status(400).json({ message: "Start time cannot be in the past." });
    }


    const event = {
      summary,
      description: description || "",
      location: location || "",
      start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
    };

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.status(201).json({
      message: "Event created successfully",
      event: response.data,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Event creation failed", error });
  }
};




const deleteEvent = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const user = await User.findOne({ accessToken: token });
   
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const { calendarId = "primary", eventId } = req.body;

    const response = await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Event deletion failed", error });
  }
};


const updateEvent = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const user = await User.findOne({ accessToken: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ access_token: token });

    const {
      calendarId = "primary",
      eventId,
      summary,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      location,
    } = req.body;

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

  
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    if (startDateTime < new Date()) {
      return res.status(400).json({ message: "Start time cannot be in the past." });
    }


    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(), 
      timeMax: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), 
    });

    const events = response.data.items;

  

    const event = {
      summary,
      description: description || "",
      location: location || "",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
    };

    const updatedEvent = await calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent.data,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Event update failed", error });
  }
};



const getEvents = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = await User.findOne({ accessToken: token });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3); 
    yesterday.setHours(0, 0, 0, 0);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: yesterday.toISOString(),
      maxResults: 25,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.status(200).json(response.data.items);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};
