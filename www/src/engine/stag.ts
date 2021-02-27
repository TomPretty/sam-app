import mapboxgl from "mapbox-gl";

class Stag {
  userId: string;
  marker: mapboxgl.Marker;

  constructor(userId: string) {
    this.userId = userId;
    this.marker = this.getMarker();
  }

  setLocation(lat: number, lon: number): void {
    this.marker.setLngLat([lon, lat]);
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
