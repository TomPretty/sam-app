import mapboxgl from "mapbox-gl";

class Stag {
  userId: string;
  marker: mapboxgl.Marker;
  isVisible: boolean;

  constructor(userId: string) {
    this.userId = userId;
    this.marker = this.getMarker();
    this.isVisible = true;
  }

  setLocation(lat: number, lon: number): void {
    this.marker.setLngLat([lon, lat]);
  }

  getLocation(): { lat: number; lon: number } {
    const { lat, lng } = this.marker.getLngLat();
    return { lat, lon: lng };
  }

  protected getMarker(): mapboxgl.Marker {
    return new mapboxgl.Marker(this.getMarkerElement()).setLngLat([0, 0]);
  }

  protected getMarkerElement(): HTMLElement {
    const el = document.createElement("div");
    el.className = `marker ${
      this.userId === "harry" ? "marker-harry" : "marker-stag"
    }`;

    const icon = document.createElement("img");
    icon.src = `/assets/${this.userId}.jpg`;

    el.appendChild(icon);

    return el;
  }
}

export default Stag;
