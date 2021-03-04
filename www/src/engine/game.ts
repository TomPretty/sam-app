import mapboxgl from "mapbox-gl";
import { getUsers } from "./api";
import { isProd } from "./env";
import { distanceBetweenPoints } from "./geo";
import MapEntity from "./mapEntity";
import * as Api from "./api";

const GAME_LOOP_INTERVAL_MS = isProd ? 2_000 : 10_000;

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tcHJldHR5IiwiYSI6ImNqenlpZGRweTBoNGEzaHF0cGNobTk4djgifQ.NNH1CBfwaAo8G8xZ8n9N9g";

type Stags = {
  [id: string]: MapEntity;
};

class Game {
  map: mapboxgl.Map;
  player: MapEntity;
  stags: Stags;
  gameLoopInterval: NodeJS.Timeout;

  constructor(playerId: string, element: string) {
    this.map = this.getMap(element);
    this.player = this.getPlayer(playerId);
    this.stags = this.getStags();

    this.gameLoop();
    this.gameLoopInterval = this.startGameLoopInterval();
  }

  static forPlayer(playerId: string, element: string): Game {
    if (playerId === "debug") {
      return new DebugGame(playerId, element);
    } else if (playerId === "harry") {
      return new HarryGame(playerId, element);
    } else {
      return new StagGame(playerId, element);
    }
  }

  end(): void {
    this.map.remove();
    clearInterval(this.gameLoopInterval);
  }

  protected getMap(element: string): mapboxgl.Map {
    return new mapboxgl.Map({
      container: element,
      style: "mapbox://styles/tompretty/cjzyie6q40nkx1crwgp74tg1m",
      center: [-1.23612530854294635, 51.749175167529975],
      zoom: 17,
      pitch: 60,
    });
  }

  protected getPlayer(playerId: string): MapEntity {
    return MapEntity.forStag(playerId);
  }

  protected getStags(): Stags {
    return {
      harry: MapEntity.forHarry("harry"),
      tom: MapEntity.forStag("tom"),
      scott: MapEntity.forStag("scott"),
      debug: MapEntity.forStag("debug"),
    };
  }

  private startGameLoopInterval() {
    return setInterval(() => this.gameLoop(), GAME_LOOP_INTERVAL_MS);
  }

  private async gameLoop() {
    await this.updatePlayerLocation();
    await this.fetchStagLocations();
    this.updateVisibleStags();
    this.drawStags();
    this.drawPlayer();
  }

  protected updatePlayerLocation(): Promise<void> {
    return new Promise((resolve) => {
      const callback: PositionCallback = async (pos) => {
        await Api.updateLocation({
          userId: this.player.userId,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });

        this.player.setLocation(pos.coords.latitude, pos.coords.longitude);

        resolve();
      };
      navigator.geolocation.getCurrentPosition(callback);
    });
  }

  private async fetchStagLocations() {
    const users = await getUsers();

    users.forEach((user) => {
      const lat = parseFloat(user.loc.lat);
      const lon = parseFloat(user.loc.lon);

      this.stags[user.id].setLocation(lat, lon);
    });
  }

  protected updateVisibleStags(): void {
    return;
  }

  private drawStags(): void {
    Object.values(this.stags).forEach((stag) => {
      if (stag.userId === this.player.userId) {
        return;
      }

      if (stag.isVisible && !stag.wasVisible) {
        stag.marker.addTo(this.map);
      } else if (!stag.isVisible && stag.wasVisible) {
        stag.marker.remove();
      }
    });
  }

  protected drawPlayer(): void {
    this.player.marker.remove();
    this.player.marker.addTo(this.map);
  }
}

export default Game;

export class DebugGame extends Game {
  protected getPlayer(): MapEntity {
    const player = MapEntity.forDebug();
    player.addTo(this.map);
    return player;
  }

  protected updatePlayerLocation(): Promise<void> {
    const { lon, lat } = this.player.getLocation();

    return new Promise((resolve) => {
      Api.updateLocation({
        userId: "debug",
        lat,
        lon,
      }).then(() => resolve());
    });
  }

  protected updateVisibleStags(): void {
    Object.values(this.stags).forEach((stag) => {
      if (stag.userId === "debug") {
        return;
      }

      stag.setVisiblity(true);
    });
  }

  protected drawPlayer(): void {
    return;
  }

  protected getStags(): Stags {
    return {
      harry: MapEntity.forHarry("harry"),
      tom: MapEntity.forStag("tom"),
      scott: MapEntity.forStag("scott"),
      debug: MapEntity.forStag("debug"),
    };
  }
}

const STAG_VISIBILITY_RADIUS_IN_M = 250;

type CaughtStags = {
  [id: string]: boolean;
};

class StagdexControl {
  _map?: mapboxgl.Map;
  _container?: HTMLElement;
  _overlay?: HTMLElement;
  _stags: { [id: string]: HTMLElement };

  constructor(stags: string[]) {
    this._stags = {};
    stags.forEach((stag) => {
      this._stags[stag] = document.createElement("li");
      this._stags[stag].textContent = stag;
      this._stags[stag].className = "stagdex-stag";
    });
  }

  catchStag(stag: string): void {
    this._stags[stag].classList.add("stagdex-stag__caught");
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl nearby-control";

    const button = document.createElement("button");
    button.className = "nearby-button";

    this._container.appendChild(button);

    this._overlay = document.createElement("div");
    this._overlay.className = "nearby-overlay";
    const header = document.createElement("h1");
    header.textContent = "Nearby";
    const body = document.createElement("div");
    const list = document.createElement("ul");

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.onclick = () => {
      if (!this._overlay || !this._container) {
        return;
      }
      document.body.removeChild(this._overlay);
      this._container.style.display = "block";
    };

    Object.values(this._stags).forEach((stag) => list.appendChild(stag));
    body.append(list);

    this._overlay.appendChild(header);
    this._overlay.appendChild(body);
    this._overlay.appendChild(closeButton);

    this._container.onclick = () => {
      if (!this._overlay || !this._container) {
        return;
      }
      document.body.prepend(this._overlay);
      this._container.style.display = "none";
    };

    return this._container;
  }

  onRemove(): void {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}

export class HarryGame extends Game {
  caughtStags: CaughtStags;
  stagdex: StagdexControl;

  constructor(playerId: string, element: string) {
    super(playerId, element);

    this.stagdex = new StagdexControl(["tom", "scott", "debug"]);
    this.map.addControl(this.stagdex, "bottom-right");

    this.caughtStags = {
      tom: false,
      scott: false,
      debug: false,
    };
  }

  protected getPlayer(playerId: string): MapEntity {
    return MapEntity.forHarry(playerId);
  }

  protected getStags(): Stags {
    const onCatch = (userId: string) => () => {
      this.caughtStags[userId] = true;
      this.stags[userId].setVisiblity(false);
      this.stags[userId].marker.remove();
      this.stagdex.catchStag(userId);
    };

    return {
      harry: MapEntity.forHarry("harry"),
      tom: MapEntity.forCatcheableStag("tom", onCatch("tom")),
      scott: MapEntity.forCatcheableStag("scott", onCatch("scott")),
      debug: MapEntity.forCatcheableStag("debug", onCatch("debug")),
    };
  }

  protected updateVisibleStags(): void {
    Object.values(this.stags).forEach((stag) => {
      if (stag.userId === this.player.userId) {
        return;
      }

      if (this.caughtStags[stag.userId]) {
        stag.setVisiblity(false);
        return;
      }

      const { lat: lat1, lon: lon1 } = this.player.getLocation();
      const { lat: lat2, lon: lon2 } = stag.getLocation();
      const distanceToStag = distanceBetweenPoints(lat1, lon1, lat2, lon2);

      stag.setVisiblity(distanceToStag <= STAG_VISIBILITY_RADIUS_IN_M);
    });
  }
}

export class StagGame extends Game {
  // stag stuff - can see all other stags
}
