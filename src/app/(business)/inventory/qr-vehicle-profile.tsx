import React, { useState } from "react";

const mockVehicles = [
  { id: 1, name: "2025 Tesla Model S", qr: "tesla-qr.png", status: "available" },
  { id: 2, name: "2024 Ford F-150", qr: "ford-qr.png", status: "pending" },
  { id: 3, name: "2023 BMW X5", qr: "bmw-qr.png", status: "sold" },
];

export default function QRCodeVehicleProfiles() {
  const [vehicles] = useState(mockVehicles);

  function handleScan(id: number) {
    alert(`QR code scanned for vehicle ${id}!`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📲 QR Code Vehicle Profiles</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Vehicles</h2>
        <ul>
          {vehicles.map(vehicle => (
            <li key={vehicle.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{vehicle.name}</span>
              <span className={`text-xs ${vehicle.status === "available" ? "text-green-700" : vehicle.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{vehicle.status}</span>
              <img src={vehicle.qr} alt="QR Code" className="w-10 h-10" />
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => handleScan(vehicle.id)}>Scan</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
