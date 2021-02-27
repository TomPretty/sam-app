import mapboxgl from "mapbox-gl";
import * as Api from "./api";

class Player {
  playerId: string;
  marker: mapboxgl.Marker;

  constructor(playerId: string) {
    this.playerId = playerId;
    this.marker = this.getMarker();
  }

  updateLocation(): void {
    const callback: PositionCallback = (pos) => {
      Api.updateLocation({
        userId: this.playerId,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    };
    navigator.geolocation.getCurrentPosition(callback);
  }

  protected getMarker(): mapboxgl.Marker {
    return new mapboxgl.Marker(this.getMarkerElement()).setLngLat([
      -1.23612530854294635,
      51.749175167529975,
    ]);
  }

  protected getMarkerElement(): HTMLElement {
    const el = document.createElement("div");
    el.className = "marker marker-me";

    const icon = document.createElement("img");
    icon.src = `/assets/${this.playerId}.jpg`;

    el.appendChild(icon);

    return el;
  }
}

export default Player;

export class DebugPlayer extends Player {
  updateLocation(): void {
    const { lng: lon, lat } = this.marker.getLngLat();

    Api.updateLocation({
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
