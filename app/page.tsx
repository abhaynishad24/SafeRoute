"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// Dynamic Loading for Leaflet because it requires the 'window' object (Client-Side only)
import dynamic from "next/dynamic";

// Dynamically import Map Components to avoid SSR errors
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Leaflet CSS inject karne ke liye standard style import
import "leaflet/dist/leaflet.css";

interface Incident {
  id: number;
  location: string;
  incident_type: string;
  description: string;
  lat?: number;
  lng?: number;
}

// Map mapping coordinates handler including UP regions based on your database inputs
const getCoordinates = (loc: string) => {
  const l = loc.toLowerCase().trim();
  
  if (l.includes("hazratganj") || l.includes("hazratgang")) return { lat: 26.8504, lng: 80.9495 };
  if (l.includes("alambagh")) return { lat: 26.8026, lng: 80.9036 };
  if (l.includes("aminabad")) return { lat: 26.8415, lng: 80.9261 };
  if (l.includes("charbagh")) return { lat: 26.8317, lng: 80.9221 };
  if (l.includes("gomti") || l.includes("gomtinagar")) return { lat: 26.8532, lng: 81.0003 };
  
  // Gorakhpur region adjustments matching your dashboard logs
  if (l === "gorakhpur") return { lat: 26.7606, lng: 83.3731 };
  if (l === "gorakhnath") return { lat: 26.7844, lng: 83.3618 };
  if (l === "bhathat") return { lat: 26.8922, lng: 83.4735 };
  if (l === "up" || l === "uttar pradesh") return { lat: 26.8467, lng: 80.9462 }; // Central state fallback

  // If unknown location, disperse closely around central point to keep markers distinct
  return { lat: 26.8467 + (Math.random() - 0.5) * 0.1, lng: 80.9462 + (Math.random() - 0.5) * 0.1 };
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [location, setLocation] = useState("");
  const [incidentType, setIncidentType] = useState("Waterlogging");
  const [description, setDescription] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsLoggedIn(!!token);
    fetchIncidents();

    // Leaflet ke default marker icons pack load fix for client layout
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setLeafletLoaded(true);
    }
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/incidents/");
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((inc: Incident) => {
          const coords = getCoordinates(inc.location);
          return { ...inc, lat: coords.lat, lng: coords.lng };
        });
        setIncidents(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Authorization header fix by reading cookie data securely
    const token = Cookies.get("access_token");
    if (!token) {
      alert("Session expired or missing token. Please Login again.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/incidents/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Passing token string directly here
        },
        body: JSON.stringify({
          location,
          incident_type: incidentType,
          description,
        }),
      });

      if (response.ok) {
        alert("Incident Reported Successfully!");
        setLocation("");
        setDescription("");
        fetchIncidents(); // Live reload dashboard stream and map layers
      } else {
        alert(`Failed to submit incident. Server Error Code: ${response.status}`);
      }
    } catch (err) {
      alert("Error connecting to backend.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white relative">
      {/* Header Panel */}
      <header className="p-4 bg-slate-800 flex justify-between items-center shadow-md z-50">
        <h1 className="text-xl font-bold text-blue-400">SafeRoute Lucknow</h1>
        {isLoggedIn && (
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold text-sm">
            Logout
          </button>
        )}
      </header>

      {/* 🗺️ INTERACTIVE LEAFLET VIEW AREA */}
      <div className="w-full h-[50vh] bg-slate-800 relative z-10 border-b border-slate-700">
        {leafletLoaded ? (
          <MapContainer 
            center={[26.8467, 80.9462]} // Focusing view window onto Central UP Region coordinates
            zoom={10} 
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidents.map((inc) => (
              <Marker key={inc.id} position={[inc.lat || 26.8467, inc.lng || 80.9462]}>
                <Popup>
                  <div className="text-black p-1">
                    <h4 className="font-bold text-sm text-blue-600">{inc.location}</h4>
                    <p className="text-xs bg-yellow-100 text-yellow-800 inline-block px-1.5 rounded font-bold my-1">
                      {inc.incident_type}
                    </p>
                    <p className="text-xs font-medium text-gray-700">{inc.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Loading SafeRoute Interactive Map Stream...
          </div>
        )}
      </div>

      {/* Main Base Grid Layout System */}
      <div className="p-6 bg-slate-800 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Incident Form Interface */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-blue-400">Report New Incident</h3>
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Location Name (e.g. Hazratganj, Alambagh, Gorakhpur)</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-blue-500" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Type area name..."
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Issue Type</label>
                <select 
                  className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-blue-500"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                >
                  <option>Waterlogging</option>
                  <option>Poor Lighting</option>
                  <option>Heavy Traffic / Road Block</option>
                  <option>Suspicious Activity</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
                <textarea 
                  className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white focus:outline-blue-500 h-20" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded transition">
                Submit Report
              </button>
            </form>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-slate-400 mb-4">You must be logged in to report an incident.</p>
              <button onClick={() => window.location.href = "/login"} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded transition w-full">
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Live Logs Component Section */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 max-h-[400px] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-green-400">Active Live Incidents ({incidents.length})</h3>
          {incidents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No report logs available.</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-3 bg-slate-800 border-l-4 border-blue-500 rounded cursor-pointer hover:bg-slate-750 transition">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-white">{inc.location}</span>
                    <span className="px-2 py-0.5 bg-slate-700 text-xs rounded text-yellow-400 font-semibold">{inc.incident_type}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{inc.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}