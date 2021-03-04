import mapboxgl from "mapbox-gl";

class MapEntity {
  userId: string;
  marker: mapboxgl.Marker;
  wasVisible: boolean;
  isVisible: boolean;

  constructor(userId: string, marker: mapboxgl.Marker) {
    this.userId = userId;
    this.marker = marker;
    this.wasVisible = false;
    this.isVisible = false;
  }

  setLocation(lat: number, lon: number): void {
    this.marker.setLngLat([lon, lat]);
  }

  getLocation(): { lat: number; lon: number } {
    const { lat, lng } = this.marker.getLngLat();
    return { lat, lon: lng };
  }

  setVisiblity(isVisible: boolean): void {
    this.wasVisible = this.isVisible;
    this.isVisible = isVisible;
  }

  addTo(map: mapboxgl.Map): void {
    this.marker.addTo(map);
  }

  static forStag(userId: string): MapEntity {
    const el = document.createElement("div");
    el.className = `marker marker-stag`;

    const icon = document.createElement("img");
    icon.src = `/assets/${userId}.jpg`;

    el.appendChild(icon);

    const marker = new mapboxgl.Marker(el).setLngLat([0, 0]);

    return new MapEntity(userId, marker);
  }

  static forHarry(userId: string): MapEntity {
    const el = document.createElement("div");
    el.className = `marker marker-harry`;

    const icon = document.createElement("img");
    icon.src = `/assets/${userId}.jpg`;

    el.appendChild(icon);

    const marker = new mapboxgl.Marker(el).setLngLat([0, 0]);

    return new MapEntity(userId, marker);
  }

  static forDebug(): MapEntity {
    const el = document.createElement("div");
    el.className = `marker marker-debug`;

    const icon = document.createElement("img");
    icon.src = `/assets/debug.jpg`;

    el.appendChild(icon);

    const marker = new mapboxgl.Marker(el)
      .setLngLat([-1.23612530854294635, 51.749175167529975])
      .setDraggable(true);

    return new MapEntity("debug", marker);
  }

  static forCatcheableStag(userId: string, onCatch: () => void): MapEntity {
    const el = document.createElement("div");
    el.className = `marker marker-stag`;
    const icon = document.createElement("img");
    icon.src = `/assets/${userId}.jpg`;

    el.appendChild(icon);

    const marker = new mapboxgl.Marker(el).setLngLat([0, 0]);

    const popupEl = document.createElement("div");
    const header = document.createElement("h1");
    header.innerText = userId;
    const button = document.createElement("button");
    button.innerText = "catch";

    button.onclick = () => {
      marker.togglePopup();
      onCatch();
    };

    popupEl.appendChild(header);
    popupEl.appendChild(button);

    const popup = new mapboxgl.Popup().setDOMContent(popupEl);

    marker.setPopup(popup);

    return new MapEntity(userId, marker);
  }
}

export default MapEntity;
