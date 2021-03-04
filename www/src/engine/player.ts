import mapboxgl from "mapbox-gl";
import * as Api from "./api";

class Player {
  playerId: string;
  marker: mapboxgl.Marker;

  constructor(playerId: string) {
    this.playerId = playerId;
    this.marker = this.getMarker();
  }

  updateLocation(): Promise<void> {
    return new Promise((resolve) => {
      const callback: PositionCallback = async (pos) => {
        await Api.updateLocation({
          userId: this.playerId,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });

        resolve();
      };
      navigator.geolocation.getCurrentPosition(callback);
    });
  }

  getLocation(): { lat: number; lon: number } {
    const { lat, lng } = this.marker.getLngLat();
    return { lat, lon: lng };
  }

  protected getMarker(): mapboxgl.Marker {
    return new mapboxgl.Marker(this.getMarkerElement()).setLngLat([
      -1.23612530854294635,
      51.749175167529975,
    ]);
  }

  protected getMarkerElement(): HTMLElement {
    const el = document.createElement("div");
    el.className = `marker ${
      this.playerId === "harry" ? "marker-harry" : "marker-me"
    } `;

    const icon = document.createElement("img");
    icon.src = `/assets/${this.playerId}.jpg`;

    el.appendChild(icon);

    return el;
  }
}

export default Player;

export class DebugPlayer extends Player {
  async updateLocation(): Promise<void> {
    const { lng: lon, lat } = this.marker.getLngLat();

    await Api.updateLocation({
      userId: this.playerId,
      lat,
      lon,
    });
  }

  protected getMarker(): mapboxgl.Marker {
    return new mapboxgl.Marker(this.getMarkerElement())
      .setDraggable(true)
      .setLngLat([-1.23612530854294635, 51.749175167529975]);
  }
}
