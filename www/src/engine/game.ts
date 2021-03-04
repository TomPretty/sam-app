import mapboxgl from "mapbox-gl";
import { getUsers } from "./api";
import { isProd } from "./env";
import { distanceBetweenPoints } from "./geo";
import Player, { DebugPlayer } from "./player";
import Stag from "./stag";

const GAME_LOOP_INTERVAL_MS = isProd ? 2_000 : 10_000;

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tcHJldHR5IiwiYSI6ImNqenlpZGRweTBoNGEzaHF0cGNobTk4djgifQ.NNH1CBfwaAo8G8xZ8n9N9g";

type Stags = {
  [id: string]: Stag;
};

class Game {
  map: mapboxgl.Map;
  player: Player;
  stags: Stags;
  gameLoopInterval: NodeJS.Timeout;

  constructor(playerId: string, element: string) {
    this.map = this.getMap(element);
    this.player = this.getPlayer(playerId);
    this.stags = this.getStags();
    this.gameLoopInterval = this.startGameLoopInterval();

    this.drawPlayer();
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

  protected getPlayer(playerId: string): Player {
    return new Player(playerId);
  }

  private getStags(): Stags {
    return {
      harry: new Stag("harry"),
      tom: new Stag("tom"),
      scott: new Stag("scott"),
      debug: new Stag("debug"),
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

  private updatePlayerLocation() {
    return this.player.updateLocation();
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
      if (stag.userId === this.player.playerId) {
        return;
      }

      stag.marker.remove();
      if (stag.isVisible) {
        stag.marker.addTo(this.map);
      }
    });
  }

  private drawPlayer(): void {
    this.player.marker.remove();
    this.player.marker.addTo(this.map);
  }
}

export default Game;

export class DebugGame extends Game {
  protected getPlayer(playerId: string): Player {
    return new DebugPlayer(playerId);
  }
}

const STAG_VISIBILITY_RADIUS_IN_M = 250;

export class HarryGame extends Game {
  protected updateVisibleStags(): void {
    Object.values(this.stags).forEach((stag) => {
      if (stag.userId === this.player.playerId) {
        return;
      }

      const { lat: lat1, lon: lon1 } = this.player.getLocation();
      const { lat: lat2, lon: lon2 } = stag.getLocation();
      const distanceToStag = distanceBetweenPoints(lat1, lon1, lat2, lon2);

      stag.isVisible = distanceToStag <= STAG_VISIBILITY_RADIUS_IN_M;
    });
  }
}

export class StagGame extends Game {
  // stag stuff - can see all other stags
}
