import mapboxgl from "mapbox-gl";
import { getUsers } from "./api";
import { isProd } from "./env";
import { distanceBetweenPoints } from "./geo";
import MapEntity from "./mapEntity";
import * as Api from "./api";
import { Message } from "../components/Map";

const GAME_LOOP_INTERVAL_MS = isProd ? 2_000 : 10_000;

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tcHJldHR5IiwiYSI6ImNqenlpZGRweTBoNGEzaHF0cGNobTk4djgifQ.NNH1CBfwaAo8G8xZ8n9N9g";

type Stags = {
  [id: string]: MapEntity;
};

type GameMessage = { type: "CAUGHT_STAG"; stagId: string };

class Game {
  map: mapboxgl.Map;
  player: MapEntity;
  stags: Stags;
  sendMessage: (message: Message) => void;
  gameLoopInterval: NodeJS.Timeout;

  constructor(
    playerId: string,
    element: string,
    sendMessage: (message: Message) => void
  ) {
    this.sendMessage = sendMessage;
    this.map = this.getMap(element);
    this.player = this.getPlayer(playerId);
    this.stags = this.getStags();

    this.gameLoop();
    this.gameLoopInterval = this.startGameLoopInterval();
  }

  static forPlayer(
    playerId: string,
    element: string,
    sendMessage: (message: Message) => void
  ): Game {
    if (playerId === "debug") {
      return new DebugGame(playerId, element, sendMessage);
    } else if (playerId === "harry") {
      return new HarryGame(playerId, element, sendMessage);
    } else {
      return new StagGame(playerId, element, sendMessage);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMessage(message: GameMessage): void {
    return;
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

export class HarryGame extends Game {
  caughtStags: CaughtStags;

  constructor(
    playerId: string,
    element: string,
    sendMessage: (message: Message) => void
  ) {
    super(playerId, element, sendMessage);

    this.caughtStags = {
      tom: false,
      scott: false,
      debug: false,
    };
  }

  onMessage(message: GameMessage): void {
    switch (message.type) {
      case "CAUGHT_STAG":
        const stagId = message.stagId;
        this.caughtStags[stagId] = true;
        this.stags[stagId].marker.remove();
        this.stags[stagId].setVisiblity(false);
        break;
    }
  }

  protected getPlayer(playerId: string): MapEntity {
    return MapEntity.forHarry(playerId);
  }

  protected getStags(): Stags {
    const onClick = (userId: string) => () => {
      this.sendMessage({ type: "SELECTED_STAG", stagId: userId });
    };

    return {
      harry: MapEntity.forHarry("harry"),
      tom: MapEntity.forCatcheableStag("tom", onClick("tom")),
      scott: MapEntity.forCatcheableStag("scott", onClick("scott")),
      debug: MapEntity.forCatcheableStag("debug", onClick("debug")),
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
