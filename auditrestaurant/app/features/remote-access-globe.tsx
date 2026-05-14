"use client"

import { World, type GlobeConfig } from "@/components/ui/globe"

const remoteGlobeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: "#082f5f",
  showAtmosphere: true,
  atmosphereColor: "#4f8fd9",
  atmosphereAltitude: 0.18,
  emissive: "#082f5f",
  emissiveIntensity: 0.18,
  shininess: 0.9,
  polygonColor: "rgba(148, 163, 184, 0.45)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1800,
  arcLength: 0.75,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 10, lng: -84 },
  autoRotate: true,
  autoRotateSpeed: 0.7,
}

const remoteGlobeData = [
  {
    order: 1,
    startLat: 9.9281,
    startLng: -84.0907,
    endLat: 40.7128,
    endLng: -74.006,
    arcAlt: 0.25,
    color: "#3b82f6",
  },
  {
    order: 2,
    startLat: 9.9281,
    startLng: -84.0907,
    endLat: 19.4326,
    endLng: -99.1332,
    arcAlt: 0.18,
    color: "#8a2f62",
  },
  {
    order: 3,
    startLat: 9.9281,
    startLng: -84.0907,
    endLat: 51.5072,
    endLng: -0.1276,
    arcAlt: 0.32,
    color: "#60a5fa",
  },
]

export default function RemoteAccessGlobe() {
  return <World globeConfig={remoteGlobeConfig} data={remoteGlobeData} />
}
