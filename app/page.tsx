"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Map = dynamic(
  () => import("../components/Map"),
  { ssr: false }
);

export default function Home() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    let url = "http://127.0.0.1:8000/api/incidents/";
    if (category) {
      url += `?category=${category}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setReports(data);
      });
  }, [category]);

  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">SafeRoute</h1>
      </nav>

      <section className="text-center mt-20">
        <div className="h-[500px] w-full mb-8">
          <Map />
        </div>
        <h2 className="text-4xl font-bold">
          AI Powered Safe Navigation
        </h2>

        <p className="mt-4 text-gray-600">
          Report incidents and find safer routes.
        </p>

        <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
          <input
            type="text"
            placeholder="Search by location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border p-2 mb-4"
          />
          Report Incident
        </button>

        <div className="mt-10 max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <input
            type="text"
            placeholder="Incident Type"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}

          >
            <option value="">Select Category</option>
            <option value="theft">Theft</option>
            <option value="assault">Assault</option>
            <option value="accident">Accident</option>
            <option value="Road Hazard">Road Hazard</option>
            <option value="other">Other</option>

          </select>
          <textarea
            placeholder="Describe the Incident"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <button
            onClick={async () => {
              if (!location || !incidentType || !description) {
                alert("Please fill all fields");
                return;
              }
              const response = await fetch(
                "http://127.0.0.1:8000/api/incidents/",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    location,
                    incident_type: incidentType,
                    severity,
                    description,
                  }),
                }
              );

              const data = await response.json();

              setReports([...reports, data]);

              setLocation("");
              setIncidentType("");
              setDescription("");
              setSeverity("Medium");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Submit Report
          </button>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-4">
            Reported Incidents
          </h3>

          {reports
            .filter((report) =>{
              const matchesSearch = report.location
                .toLowerCase()
                .includes(search.toLowerCase());
              const matchesCategory = !category || report.category === category;
              return matchesSearch && matchesCategory;
            })  
            .map((report, index) => (

              <div
                key={index}
                className="bg-white border p-4 mb-3 rounded shadow text-left"
              >
                <p>
                  <strong>Location:</strong> {report.location}
                </p>

                <p>
                  <strong>Type:</strong> {report.incident_type}
                </p>

                <p>
                  <strong>Severity:</strong> {report.severity}
                </p>

                <p>
                  <strong>Description:</strong> {report.description}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "N/A"}
                </p>

                <button
                  onClick={() => {
                    setReports(reports.filter((_, i) => i !== index))
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}