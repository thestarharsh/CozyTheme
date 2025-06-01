import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';

interface Position {
  x: number;
  y: number;
}

const BOARD_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 200;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 5, y: 5 });
    setDirection(INITIAL_DIRECTION);
    setGameRunning(false);
    setScore(0);
    setGameOver(false);
  };

  const startGame = () => {
    resetGame();
    setGameRunning(true);
  };

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, generateFood]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  const handleDirectionChange = (newDirection: Position) => {
    if (!gameRunning) return;
    
    if (newDirection.x !== 0 && direction.x === 0) {
      setDirection(newDirection);
    } else if (newDirection.y !== 0 && direction.y === 0) {
      setDirection(newDirection);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-gray-900 to-black rounded-3xl p-6 shadow-2xl border-4 border-gray-700 relative">
      {/* iPhone-like notch */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full"></div>
      
      {/* Screen */}
      <div className="bg-green-900 rounded-2xl p-4 mt-4 border-2 border-green-700">
        <div className="flex justify-between items-center mb-4">
          <div className="text-green-400 font-mono text-sm">Score: {score}</div>
          <div className="text-green-400 font-mono text-xs">CozyGripz</div>
        </div>

        {/* Game Board */}
        <div 
          className="grid gap-0.5 bg-green-800 p-2 rounded-lg mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: '280px',
            height: '280px'
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;
            const isHead = snake[0]?.x === x && snake[0]?.y === y;

            return (
              <div
                key={index}
                className={`
                  w-full h-full rounded-sm
                  ${isSnake 
                    ? isHead 
                      ? 'bg-green-300 border border-green-200' 
                      : 'bg-green-400 border border-green-300'
                    : isFood 
                      ? 'bg-red-500 border border-red-400 animate-pulse' 
                      : 'bg-green-800'
                  }
                `}
              />
            );
          })}
        </div>

        {/* Game Controls */}
        <div className="mt-4 space-y-3">
          {!gameRunning && !gameOver && (
            <Button 
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-500 text-white"
            >
              Start Game
            </Button>
          )}
          
          {gameOver && (
            <div className="text-center">
              <div className="text-red-400 font-mono mb-2">Game Over!</div>
              <Button 
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-500 text-white"
              >
                Play Again
              </Button>
            </div>
          )}

          {gameRunning && (
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <Button
                onTouchStart={() => handleDirectionChange({ x: 0, y: -1 })}
                onClick={() => handleDirectionChange({ x: 0, y: -1 })}
                className="bg-green-700 hover:bg-green-600 text-white h-8 text-xs"
              >
                ↑
              </Button>
              <div></div>
              <Button
                onTouchStart={() => handleDirectionChange({ x: -1, y: 0 })}
                onClick={() => handleDirectionChange({ x: -1, y: 0 })}
                className="bg-green-700 hover:bg-green-600 text-white h-8 text-xs"
              >
                ←
              </Button>
              <div></div>
              <Button
                onTouchStart={() => handleDirectionChange({ x: 1, y: 0 })}
                onClick={() => handleDirectionChange({ x: 1, y: 0 })}
                className="bg-green-700 hover:bg-green-600 text-white h-8 text-xs"
              >
                →
              </Button>
              <div></div>
              <Button
                onTouchStart={() => handleDirectionChange({ x: 0, y: 1 })}
                onClick={() => handleDirectionChange({ x: 0, y: 1 })}
                className="bg-green-700 hover:bg-green-600 text-white h-8 text-xs"
              >
                ↓
              </Button>
              <div></div>
            </div>
          )}
        </div>

        {gameRunning && (
          <div className="mt-3 text-center text-green-300 text-xs">
            Use arrow keys or touch controls
          </div>
        )}
      </div>
      
      {/* iPhone-like home indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
    </div>
  );
}