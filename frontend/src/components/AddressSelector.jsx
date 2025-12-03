import { useEffect, useState, useCallback } from "react";
import { useFormContext } from "../contexts/FormContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";

// --- Config: Philippines Bounds ---
const PH_BOUNDS = [
  [4.2, 116.8], // SouthWest
  [21.2, 126.6], // NorthEast
];

// Custom Marker Icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Component: Handle Map Clicks ---
function LocationMarker({ location, setLocation }) {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      // Visual check: Is click roughly in PH bounds?
      if (!map.getBounds().contains(e.latlng)) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
        );
        const data = await res.json();

        // Strict API Check: Is it actually Philippines?
        if (data.address?.country_code !== "ph") {
          alert("Please select a location within the Philippines.");
          return;
        }

        const newLoc = {
          lat,
          lng,
          full: data.display_name,
        };
        setLocation(newLoc);
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    },
  });

  return location ? (
    <Marker position={[location.lat, location.lng]} icon={defaultIcon}>
      <Popup>{location.full}</Popup>
    </Marker>
  ) : null;
}

// --- Component: Fly to location ---
function SetView({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

// --- MAIN EXPORT ---
export default function AddressSelector() {
  const { form, updateForm } = useFormContext();

  // Load existing data if available
  const [location, setLocation] = useState(
    form.AddressLat
      ? { lat: form.AddressLat, lng: form.AddressLng, full: form.Address }
      : null
  );

  const [search, setSearch] = useState(location?.full || "");
  const [isLoading, setIsLoading] = useState(false);

  // Logic: Only show map if there is a location OR user clicks a button
  const [showMap, setShowMap] = useState(!!location);

  const provider = new OpenStreetMapProvider({
    params: { countrycodes: "ph", "accept-language": "en" },
  });

  // --- Search Handler ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsLoading(true);
    setShowMap(true); // REVEAL MAP

    try {
      const results = await provider.search({ query: search });
      if (results.length === 0) {
        alert("Location not found in the Philippines.");
        return;
      }

      // Result 0 is usually the best match
      const { x: lng, y: lat, label } = results[0];
      const newLoc = { lat, lng, full: label };

      setLocation(newLoc);
      setSearch(label);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GPS Handler ---
  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) return alert("GPS not supported.");

    setIsLoading(true);
    setShowMap(true); // REVEAL MAP

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();

          if (data.address?.country_code !== "ph") {
            alert("You are currently outside the Philippines.");
            return;
          }

          const newLoc = { lat, lng, full: data.display_name };
          setLocation(newLoc);
          setSearch(data.display_name);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        alert("Could not detect location.");
      }
    );
  }, []);

  // Sync to parent context
  useEffect(() => {
    if (location) {
      updateForm("Address", location.full);
      updateForm("AddressLat", location.lat);
      updateForm("AddressLng", location.lng);
    }
  }, [location, updateForm]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
        Address
      </label>

      {/* Input Group */}
      <div className="flex gap-2 h-12">
        <div className="relative flex-1 h-full">
          <form onSubmit={handleSearch} className="h-full">
            <input
              className="w-full h-full px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="Search city or barangay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Square Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="h-12 w-12 flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center transition shadow-sm active:scale-95"
          title="Search"
        >
          {/* Search Icon SVG */}
          {isLoading ? (
            "..."
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>

        {/* Square GPS Button */}
        <button
          onClick={handleGPS}
          disabled={isLoading}
          className="h-12 w-12 flex-shrink-0 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center transition active:scale-95"
          title="Use Current Location"
        >
          {/* GPS Icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Map: Conditionally Rendered with Fade-In */}
      {showMap && (
        <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-gray-200 mt-2 animate-in fade-in duration-500">
          <MapContainer
            center={
              location ? [location.lat, location.lng] : [12.8797, 121.774]
            } // PH Center
            zoom={location ? 16 : 6}
            minZoom={5}
            maxBounds={PH_BOUNDS}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker
              location={location}
              setLocation={(loc) => {
                setLocation(loc);
                setSearch(loc.full);
              }}
            />
            <SetView position={location} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}
