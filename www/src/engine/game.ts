import mapboxgl from "mapbox-gl";
import { getUsers } from "./api";
import { isProd } from "./env";
import Player, { DebugPlayer } from "./player";
import Stag from "./stag";

const UPDATE_PLAYER_LOCATION_INTERVAL_MS = isProd ? 1_000 : 15_000;
const FETCH_STAG_LOCATIONS_INTERVAL_MS = isProd ? 2_000 : 15_000;

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tcHJldHR5IiwiYSI6ImNqenlpZGRweTBoNGEzaHF0cGNobTk4djgifQ.NNH1CBfwaAo8G8xZ8n9N9g";

class Game {
  map: mapboxgl.Map;
  player: Player;
  stags: Stag[];
  updatePlayerLocationInterval: NodeJS.Timeout;
  fetchStagLocationsTimeout: NodeJS.Timeout;

  constructor(playerId: string, element: string) {
    this.map = this.getMap(element);
    this.player = this.getPlayer(playerId);
    this.player.marker.addTo(this.map);

    this.updatePlayerLocationInterval = this.startUpdatePlayerLocationInterval();

    this.stags = this.getStags(playerId);
    this.stags.forEach((stag) => stag.marker.addTo(this.map));
    this.fetchStagLocationsTimeout = this.startFetchStagLocationsInterval();
  }

  static forPlayer(playerId: string, element: string): Game {
    if (playerId === "debug") {
      return new DebugGame(playerId, element);
    } else {
      return new StagGame(playerId, element);
    }
  }

  update(): void {
    // only show visible visible stags
  }

  end(): void {
    this.map.remove();
    clearInterval(this.updatePlayerLocationInterval);
    clearInterval(this.fetchStagLocationsTimeout);
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

  private getStags(playerId: string): Stag[] {
    return [
      new Stag("harry"),
      new Stag("tom"),
      new Stag("scott"),
      new Stag("debug"),
    ].filter((stag) => stag.userId != playerId);
  }

  private startUpdatePlayerLocationInterval() {
    return setInterval(() => {
      this.player.updateLocation();
    }, UPDATE_PLAYER_LOCATION_INTERVAL_MS);
  }

  private startFetchStagLocationsInterval() {
    return setInterval(async () => {
      const users = await getUsers();

      users.forEach((user) => {
        this.stags.forEach((stag) => {
          if (user.id === stag.userId) {
            const lat = parseFloat(user.loc.lat);
            const lon = parseFloat(user.loc.lon);

            stag.setLocation(lat, lon);
          }
        });
      });
    }, FETCH_STAG_LOCATIONS_INTERVAL_MS);
  }
}

export default Game;

export class DebugGame extends Game {
  protected getPlayer(playerId: string): Player {
    return new DebugPlayer(playerId);
  }
}

export class StagGame extends Game {
  // stag stuff - can see all other stags
}
