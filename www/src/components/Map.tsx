import React, { useState, useEffect, useRef } from "react";
import Game from "../engine/game";

const GAME_CONTAINER_ID = "game-container";

const Map: React.FC = ({}) => {
  const [, setGame] = useState<Game | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

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
