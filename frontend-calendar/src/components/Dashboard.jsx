import axios from "axios";
import { useEffect, useState, useRef } from "react";
import "../styles/Dashboard.css";
import { FaFileCsv, FaFilePdf, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    totalEventsThisMonth: 0,
    avgDuration: 0,
    busiestDay: "N/A",
  });
  const [filterDate, setFilterDate] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchEvents(token);
    } else {
      console.log("No Google token found.");
    }

    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setIsFormVisible(false);
        setEditingEvent(null);
        setNewEvent({
          summary: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          description: "",
          location: "",
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); 

  
  const fetchEvents = async (token) => {
    setLoading(true); 
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events/getevent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const events = response.data.sort(
        (a, b) => new Date(b.start.dateTime) - new Date(a.start.dateTime)
      );
      setEvents(events);
      setFilteredEvents(events);
      setLoading(false);
      calculateInsights(events);
    } catch (error) {
      console.error("Error fetching events", error);
      setLoading(false);
    }
  };

  const calculateInsights = (events) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const eventsThisMonth = events.filter(
      (event) =>
        new Date(event.start.dateTime).getMonth() === thisMonth &&
        new Date(event.start.dateTime).getFullYear() === thisYear
    );

    const durations = events.map(
      (event) =>
        (new Date(event.end.dateTime) - new Date(event.start.dateTime)) /
        (60 * 1000) 
    );

    const busiestDays = events.reduce((acc, event) => {
      const day = new Date(event.start.dateTime).toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const busiestDay = Object.keys(busiestDays).sort(
      (a, b) => busiestDays[b] - busiestDays[a]
    )[0];

    setInsights({
      totalEventsThisMonth: eventsThisMonth.length,
      avgDuration: durations.length
        ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
        : 0,
      busiestDay: busiestDay || "N/A",
    });
  };

  const filterByDate = (date) => {
    if (!date) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter((event) => {
      const eventDate = new Date(event.start.dateTime)
        .toISOString()
        .split("T")[0];
      return eventDate === date;
    });

    setFilteredEvents(filtered);
  };

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      fetchEvents(token); 
      navigate("/dashboard"); 
    }
  }, [navigate]);

  const exportToCSV = () => {
    const csvData = events.map((event) => ({
      Name: event.summary,
      Start: new Date(event.start.dateTime).toLocaleString(),
      End: new Date(event.end.dateTime).toLocaleString(),
      Description: event.description || "N/A",
      Location: event.location || "N/A",
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "events.csv");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Event List", 10, 10);
    events.forEach((event, index) => {
      doc.text(
        `${index + 1}. ${event.summary}, ${new Date(
          event.start.dateTime
        ).toLocaleString()} - ${new Date(event.end.dateTime).toLocaleString()}`,
        10,
        20 + index * 10
      );
    });
    doc.save("events.pdf");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate(-5); 
  };

  const handleCreateEventForm = () => {
    setIsFormVisible(!isFormVisible);
    setEditingEvent(null); 
  };

  const handleChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
  
    const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
    const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);
  
    const today = new Date();
  
    
    if (startDateTime < today) {
      alert("Start date and time cannot be in the past.");
      return;
    }
  
    
    if (startDateTime >= endDateTime) {
      alert("End time must be after start time.");
      return;
    }
  
  
    const token = localStorage.getItem("authToken");
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/createevent`,
        {
          summary: newEvent.summary,
          startDate: newEvent.startDate,
          startTime: newEvent.startTime,
          endDate: newEvent.endDate,
          endTime: newEvent.endTime,
          description: newEvent.description,
          location: newEvent.location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      
      toast.success("Event created successfully!");
      fetchEvents(token); 
      setIsFormVisible(false); 
      setNewEvent({
        summary: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
        location: "",
      }); 
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message); 
      } else {
        toast.error("An error occurred while creating the event.");
      }
      console.error("Error creating event:", error);
     

      
    }
  };
  

  const handleEditEvent = (event) => {
    setEditingEvent(event); 
    setNewEvent({
      summary: event.summary,
      startDate: event.start.dateTime.split("T")[0],
      startTime: event.start.dateTime.split("T")[1].split(".")[0],
      endDate: event.end.dateTime.split("T")[0],
      endTime: event.end.dateTime.split("T")[1].split(".")[0],
      description: event.description,
      location: event.location,
    });
    setIsFormVisible(true); 
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/updateevent`,
        {
          eventId: editingEvent.id,
          summary: newEvent.summary,
          startDate: newEvent.startDate,
          startTime: newEvent.startTime,
          endDate: newEvent.endDate,
          endTime: newEvent.endTime,
          description: newEvent.description,
          location: newEvent.location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

     
      toast.success("Event updated successfully!");
      fetchEvents(token); 
      setIsFormVisible(false); 
      setNewEvent({
        summary: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
        location: "",
      }); 
      setEditingEvent(null); 
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message); 
      } else {
        toast.error("An error occurred while creating the event.");
      }
      console.error("Error creating event:", error);
      
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/events/deleteevent`,
        {
          data: { eventId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Event deleted successfully!");
      fetchEvents(token); 
    } catch (error) {
      console.error("Error deleting event", error);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="main-header">
          <div className="logo">
            <h2>Events Calendar</h2>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </header>

        <section className="calendar-section">
         
          {isFormVisible && (
            <div className="modal-background">
              <form
                ref={formRef}
                onSubmit={editingEvent ? handleUpdateEvent : handleSubmitEvent}
                className="event-form-card"
              >
                <h3>{editingEvent ? "Edit Event" : "Create Event"}</h3>
                <input
                  type="text"
                  name="summary"
                  placeholder="Event Name"
                  value={newEvent.summary}
                  onChange={handleChange}
                  required
                />
                <div className="input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newEvent.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={newEvent.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newEvent.endDate}
                    min={newEvent.startDate}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={newEvent.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={handleChange}
                />
                <button type="submit">
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </form>
            </div>
          )}

          <div className="insights">
            <h3>Event Insights</h3>
            <p>Total Events This Month: {insights.totalEventsThisMonth}</p>
            <p>Average Duration: {insights.avgDuration} minutes</p>
            <p>Busiest Day: {insights.busiestDay}</p>
          </div>
          <div className="controls">
            <div className="export-buttons">
              <button onClick={exportToCSV}>
                <FaFileCsv /> Export to CSV
              </button>
              <button onClick={exportToPDF}>
                <FaFilePdf /> Export to PDF
              </button>
            </div>

            <h3>
              Filter By Date :
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  filterByDate(e.target.value);
                }}
                placeholder="Filter by date"
              />
            </h3>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="events-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.summary}</td>
                    <td>{new Date(event.start.dateTime).toLocaleString()}</td>
                    <td>{new Date(event.end.dateTime).toLocaleString()}</td>
                    <td>{event.description || "N/A"}</td>
                    <td>{event.location || "N/A"}</td>
                    <td className="btn-del">
                      <button onClick={() => handleEditEvent(event)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="create-event-section">
            <button
              className="create-event-button"
              onClick={handleCreateEventForm}
            >
              <FaPlus /> Create Event
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
