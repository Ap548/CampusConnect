<template>
  <div>
    <!-- Dropdowns for selecting start and end points -->
    <div>
      <label for="start">Start:</label>
      <select
        id="start"
        v-model="selectedStart"
      >
        <option
          v-for="(feature, index) in geoData.features"
          :key="index"
          :value="feature"
        >
          {{ feature.properties.name }}
        </option>
      </select>

      <label for="end">End:</label>
      <select
        id="end"
        v-model="selectedEnd"
      >
        <option
          v-for="(feature, index) in geoData.features"
          :key="index"
          :value="feature"
        >
          {{ feature.properties.name }}
        </option>
      </select>

      <label for="vehicle">Vehicle Type:</label>
      <select
        id="vehicle"
        v-model="vehicleType"
      >
        <option value="diesel">
          Diesel
        </option>
        <option value="gas">
          Gas
        </option>
        <option value="electric">
          Electric
        </option>
      </select>

      <label for="passengers">Passengers:</label>
      <input
        v-model.number="numPassengers"
        type="number"
        min="1"
      >

      <button @click="drawRoute">
        Calculate Best Route
      </button>
    </div>

    <!-- CO₂ Savings Display -->
    <div v-if="co2Saved !== null">
      <p>
        <strong>CO₂ Saved:</strong> {{ co2Saved.toFixed(2) }} kg
      </p>
    </div>

    <!-- Map -->
    <div
      id="map"
      style="height: 500px;"
    />
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet-routing-machine";
import jsonData from "../data/orte.json";

export default {
  data() {
    return {
      geoData: jsonData,
      map: null,
      selectedStart: null,
      selectedEnd: null,
      routingControl: null,
      co2Saved: null,
      numPassengers: 2,
      vehicleType: "diesel", // Default vehicle type
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      // Initialize the map
      this.map = L.map("map").setView([49.934, 11.58], 13);

      // Add a basic tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      // Add markers from JSON data
      this.geoData.features.forEach((feature) => {
        const { coordinates } = feature.geometry;
        const { name } = feature.properties;

        L.marker([coordinates[1], coordinates[0]])
          .addTo(this.map)
          .bindPopup(name || "No Name");
      });
    },
    drawRoute() {
      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
      }

      if (this.selectedStart && this.selectedEnd) {
        const startCoords = this.selectedStart.geometry.coordinates;
        const endCoords = this.selectedEnd.geometry.coordinates;

        this.routingControl = L.Routing.control({
          waypoints: [
            L.latLng(startCoords[1], startCoords[0]),
            L.latLng(endCoords[1], endCoords[0]),
          ],
          routeWhileDragging: true,
          showAlternatives: true,
          altLineOptions: { color: "blue", opacity: 0.5 },
        })
          .on("routesfound", this.calculateCO2Savings)
          .addTo(this.map);
      } else {
        alert("Please select both a start and end point.");
      }
    },
    calculateCO2Savings(event) {
      const route = event.routes[0];
      const distanceKm = route.summary.totalDistance / 1000;

      // Set CO₂ emissions per km based on vehicle type
      let co2PerKm;
      switch (this.vehicleType) {
        case "diesel":
          co2PerKm = 160; // Diesel: 160g/km
          break;
        case "gas":
          co2PerKm = 120; // Gas: 120g/km
          break;
        case "electric":
          co2PerKm = 0; // Electric: 0g/km
          break;
        default:
          co2PerKm = 120; // Default to Gas
      }

      // Calculate total CO₂ and savings
      const totalCO2 = distanceKm * co2PerKm;
      this.co2Saved = ((this.numPassengers - 1) * totalCO2) / 1000; // Convert grams to kilograms
    },
  },
};
</script>
