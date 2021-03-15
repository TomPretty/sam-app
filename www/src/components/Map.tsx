import React, { useState, useRef } from "react";
import Game from "../engine/game";
import { useOnce } from "../hooks/useOnce";

const GAME_CONTAINER_ID = "game-container";

export type Message = { type: "SELECTED_STAG"; stagId: string };

interface GameState {
  status: "IN_GAME" | "CATCHING_STAG" | "VIEWING_STAGDEX";
  selectedStagId: string | null;
  caughtStags: { [stagId: string]: boolean };
}

const INITIAL_STATE: GameState = {
  status: "IN_GAME",
  selectedStagId: null,
  caughtStags: {
    tom: false,
    scott: false,
    debug: false,
  },
};

const Map: React.FC = ({}) => {
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const mapContainer = useRef<HTMLDivElement>(null);

  const startCatchingStag = (stagId: string) => {
    setGameState({
      ...gameState,
      status: "CATCHING_STAG",
      selectedStagId: stagId,
    });
  };

  const closeCatchMenu = () => {
    setGameState({
      ...gameState,
      status: "IN_GAME",
      selectedStagId: null,
    });
  };

  const catchStag = () => {
    if (!gameState.selectedStagId) {
      return;
    }

    game?.onMessage({ type: "CAUGHT_STAG", stagId: gameState.selectedStagId });

    setGameState({
      ...gameState,
      status: "IN_GAME",
      selectedStagId: null,
      caughtStags: {
        ...gameState.caughtStags,
        [gameState.selectedStagId]: true,
      },
    });
  };

  const onMessage = (message: Message) => {
    switch (message.type) {
      case "SELECTED_STAG":
        startCatchingStag(message.stagId);
        break;
    }
  };

  useOnce(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get("playerId");

    if (!playerId) {
      return;
    }

    const game = Game.forPlayer(playerId, GAME_CONTAINER_ID, onMessage);
    setGame(game);
    return () => {
      game.end();
      setGame(null);
    };
  }, [mapContainer.current]);

  return (
    <div className="game-container">
      {gameState.status === "CATCHING_STAG" && (
        <div className="ui-container">
          <button onClick={closeCatchMenu}></button>
          <div className="catch-stag-container">
            <h2>{gameState.selectedStagId}</h2>
            <button onClick={catchStag}>catch</button>
          </div>
        </div>
      )}
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
