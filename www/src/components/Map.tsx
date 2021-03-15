import React, { useState, useRef } from "react";
import Game from "../engine/game";
import { useOnce } from "../hooks/useOnce";

const GAME_CONTAINER_ID = "game-container";

const Map: React.FC = ({}) => {
  const [, setGame] = useState<Game | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useOnce(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get("playerId");

    if (!playerId) {
      return;
    }

    const game = Game.forPlayer(playerId, GAME_CONTAINER_ID);
    setGame(game);
    return () => {
      game.end();
      setGame(null);
    };
  }, [mapContainer.current]);

  return (
    <div>
      <div
        className="map-container"
        id={GAME_CONTAINER_ID}
        ref={mapContainer}
      />
      ;
    </div>
  );
};

export default Map;
