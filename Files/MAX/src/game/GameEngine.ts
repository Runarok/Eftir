import MazeGenerator from './MazeGenerator';
import Player from './Player';
import EchoPulse from './EchoPulse';
import Collectible from './Collectible';
import { Cell, CellType, Position, GameMode } from '../types/game';

export default class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mazeGenerator: MazeGenerator;
  private player: Player;
  private maze: Cell[][];
  private echoPulses: EchoPulse[];
  private collectibles: Collectible[];
  private exitPosition: Position;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private theme: 'dark' | 'light';
  private isPaused: boolean = true;
  
  public maxEchoes: number = 5;
  private echoesRemaining: number = this.maxEchoes;
  private collectiblesFound: number = 0;
  public totalCollectibles: number = 3;
  private levelComplete: boolean = false;
  
  public onEchoUsed: (remaining: number) => void = () => {};
  public onCollectibleFound: (found: number, total: number) => void = () => {};
  public onGameOver: () => void = () => {};
  public onLevelComplete: () => void = () => {};
  
  constructor(canvas: HTMLCanvasElement, theme: 'dark' | 'light') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.theme = theme;
    
    const cellSize = 30;
    const mazeWidth = Math.floor(canvas.width / cellSize);
    const mazeHeight = Math.floor(canvas.height / cellSize);
    
    this.mazeGenerator = new MazeGenerator(mazeWidth, mazeHeight, cellSize);
    this.maze = this.mazeGenerator.generate();
    
    const startPosition = this.mazeGenerator.getStartPosition();
    this.player = new Player(
      startPosition.x * cellSize + cellSize / 2,
      startPosition.y * cellSize + cellSize / 2,
      cellSize / 2,
      this.theme
    );
    
    this.exitPosition = this.mazeGenerator.getExitPosition();
    this.echoPulses = [];
    this.collectibles = [];
    this.placeCollectibles();
    
    this.setupControls();
    this.startGameLoop();
  }
  
  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      if (this.isPaused || this.player.isCurrentlyMoving()) return;
      
      let moved = false;
      
      if (['ArrowUp', 'w', 'W'].includes(e.key)) {
        moved = this.player.move(0, -1, this.maze, this.mazeGenerator.getCellSize());
      } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
        moved = this.player.move(0, 1, this.maze, this.mazeGenerator.getCellSize());
      } else if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        moved = this.player.move(-1, 0, this.maze, this.mazeGenerator.getCellSize());
      } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        moved = this.player.move(1, 0, this.maze, this.mazeGenerator.getCellSize());
      }
      
      if (e.key === ' ') {
        if (this.echoesRemaining > 0) {
          this.sendEchoPulse();
        } else if (!this.levelComplete) {
          this.onGameOver();
        }
      }
      
      if (moved) {
        this.checkCollectibles();
        this.checkExit();
      }
    });
  }

  public pause(): void {
    this.isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.startGameLoop();
  }
  
  private placeCollectibles(): void {
    this.collectibles = [];
    const emptyPositions = this.mazeGenerator.getEmptyPositions();
    
    const startPos = this.mazeGenerator.getStartPosition();
    const exitPos = this.mazeGenerator.getExitPosition();
    
    const filteredPositions = emptyPositions.filter(pos => {
      const distanceToStart = Math.abs(pos.x - startPos.x) + Math.abs(pos.y - startPos.y);
      const distanceToExit = Math.abs(pos.x - exitPos.x) + Math.abs(pos.y - exitPos.y);
      return distanceToStart > 3 && distanceToExit > 3;
    });
    
    for (let i = 0; i < this.totalCollectibles; i++) {
      if (filteredPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredPositions.length);
        const position = filteredPositions.splice(randomIndex, 1)[0];
        
        this.collectibles.push(new Collectible(
          position.x * this.mazeGenerator.getCellSize() + this.mazeGenerator.getCellSize() / 2,
          position.y * this.mazeGenerator.getCellSize() + this.mazeGenerator.getCellSize() / 2,
          this.mazeGenerator.getCellSize() / 3,
          this.theme
        ));
      }
    }
    
    this.totalCollectibles = this.collectibles.length;
    this.collectiblesFound = 0;
  }
  
  private sendEchoPulse(): void {
    this.echoPulses.push(new EchoPulse(
      this.player.x,
      this.player.y,
      0,
      this.theme
    ));
    
    this.echoesRemaining--;
    this.onEchoUsed(this.echoesRemaining);
  }
  
  private checkForGameOver(): void {
    const playerCell = {
      x: Math.floor(this.player.x / this.mazeGenerator.getCellSize()),
      y: Math.floor(this.player.y / this.mazeGenerator.getCellSize())
    };
    
    const exitCell = this.exitPosition;
    
    if (playerCell.x === exitCell.x && playerCell.y === exitCell.y && 
        this.collectiblesFound === this.totalCollectibles) {
      this.levelComplete = true;
      this.onLevelComplete();
      return;
    }
  }
  
  private startGameLoop(): void {
    const loop = (timestamp: number) => {
      if (this.isPaused) return;

      const deltaTime = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = this.theme === 'dark' ? '#121212' : '#f8f9fa';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawMaze();
      this.updateEchoPulses(deltaTime);
      this.checkCollectibles();
      this.checkExit();
      
      // Draw collectibles after maze but before player
      for (const collectible of this.collectibles) {
        collectible.draw(this.ctx);
      }
      
      this.player.draw(this.ctx);
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    
    this.animationFrameId = requestAnimationFrame(loop);
  }
  
  private drawMaze(): void {
    const cellSize = this.mazeGenerator.getCellSize();
    
    const exitX = this.exitPosition.x * cellSize;
    const exitY = this.exitPosition.y * cellSize;
    this.ctx.fillStyle = this.theme === 'dark' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 200, 0, 0.2)';
    this.ctx.fillRect(exitX, exitY, cellSize, cellSize);
    
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const cellX = x * cellSize;
        const cellY = y * cellSize;
        
        if (cell.type === CellType.WALL && cell.visible > 0) {
          const opacity = Math.min(cell.visible, 1);
          
          this.ctx.fillStyle = this.theme === 'dark' 
            ? `rgba(120, 87, 255, ${opacity})` 
            : `rgba(59, 130, 246, ${opacity})`;
          
          this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
          
          if (this.theme === 'dark' && opacity > 0.5) {
            this.ctx.shadowColor = 'rgba(120, 87, 255, 0.8)';
            this.ctx.shadowBlur = 10;
            this.ctx.strokeStyle = 'rgba(180, 160, 255, 0.8)';
            this.ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            this.ctx.shadowBlur = 0;
          }
        }
        
        if (cell.visible > 0) {
          cell.visible -= 0.01;
          if (cell.visible < 0) cell.visible = 0;
        }
      }
    }
  }
  
  private updateEchoPulses(deltaTime: number): void {
    for (let i = this.echoPulses.length - 1; i >= 0; i--) {
      const pulse = this.echoPulses[i];
      pulse.update(deltaTime);
      this.revealCellsByPulse(pulse);
      pulse.draw(this.ctx);
      
      if (pulse.radius > pulse.maxRadius) {
        this.echoPulses.splice(i, 1);
      }
    }
  }
  
  private revealCellsByPulse(pulse: EchoPulse): void {
    const cellSize = this.mazeGenerator.getCellSize();
    const pulseRadius = pulse.radius;
    
    const centerX = Math.floor(pulse.x / cellSize);
    const centerY = Math.floor(pulse.y / cellSize);
    const range = Math.ceil(pulseRadius / cellSize);
    
    for (let y = centerY - range; y <= centerY + range; y++) {
      for (let x = centerX - range; x <= centerX + range; x++) {
        if (y < 0 || y >= this.maze.length || x < 0 || x >= this.maze[0].length) {
          continue;
        }
        
        const cellCenterX = x * cellSize + cellSize / 2;
        const cellCenterY = y * cellSize + cellSize / 2;
        const distance = Math.sqrt(
          Math.pow(cellCenterX - pulse.x, 2) + 
          Math.pow(cellCenterY - pulse.y, 2)
        );
        
        if (distance <= pulseRadius) {
          const visibility = 1 - (distance / pulseRadius);
          
          if (this.maze[y][x].visible < visibility) {
            this.maze[y][x].visible = visibility;
          }
        }
      }
    }
  }
  
  private checkCollectibles(): void {
    const playerCell = this.player.getCurrentCell(this.mazeGenerator.getCellSize());
    const cellSize = this.mazeGenerator.getCellSize();
    
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      const collectibleCell = {
        x: Math.floor(collectible.x / cellSize),
        y: Math.floor(collectible.y / cellSize)
      };
      
      // Check if player is on the same cell or adjacent cells
      const isAdjacent = (
        (Math.abs(playerCell.x - collectibleCell.x) <= 1 && playerCell.y === collectibleCell.y) ||
        (Math.abs(playerCell.y - collectibleCell.y) <= 1 && playerCell.x === collectibleCell.x)
      );
      
      if (isAdjacent) {
        // Remove collectible
        this.collectibles.splice(i, 1);
        this.collectiblesFound++;
        
        // Update UI
        this.onCollectibleFound(this.collectiblesFound, this.totalCollectibles);
        
        // Give player an extra echo as reward
        this.echoesRemaining++;
        this.onEchoUsed(this.echoesRemaining);
      }
    }
  }
  
  private checkExit(): void {
    const playerCell = {
      x: Math.floor(this.player.x / this.mazeGenerator.getCellSize()),
      y: Math.floor(this.player.y / this.mazeGenerator.getCellSize())
    };
    
    if (playerCell.x === this.exitPosition.x && 
        playerCell.y === this.exitPosition.y && 
        this.collectiblesFound === this.totalCollectibles && 
        !this.levelComplete) {
      this.levelComplete = true;
      this.onLevelComplete();
    }
  }
  
  public startNewGame(): void {
    this.maze = this.mazeGenerator.generate();
    
    const startPosition = this.mazeGenerator.getStartPosition();
    const cellSize = this.mazeGenerator.getCellSize();
    this.player.x = startPosition.x * cellSize + cellSize / 2;
    this.player.y = startPosition.y * cellSize + cellSize / 2;
    
    this.exitPosition = this.mazeGenerator.getExitPosition();
    this.echoesRemaining = this.maxEchoes;
    this.placeCollectibles();
    this.levelComplete = false;
    this.isPaused = false;
  }
  
  public nextLevel(): void {
    this.maxEchoes = Math.max(3, this.maxEchoes - 1);
    this.totalCollectibles++;
    
    this.maze = this.mazeGenerator.generate();
    
    const startPosition = this.mazeGenerator.getStartPosition();
    const cellSize = this.mazeGenerator.getCellSize();
    this.player.x = startPosition.x * cellSize + cellSize / 2;
    this.player.y = startPosition.y * cellSize + cellSize / 2;
    
    this.exitPosition = this.mazeGenerator.getExitPosition();
    this.echoesRemaining = this.maxEchoes;
    this.placeCollectibles();
    this.levelComplete = false;
    this.isPaused = false;
  }
  
  public updateTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
    this.player.updateTheme(theme);
    
    for (const pulse of this.echoPulses) {
      pulse.updateTheme(theme);
    }
    
    for (const collectible of this.collectibles) {
      collectible.updateTheme(theme);
    }
  }
  
  public resize(width: number, height: number): void {
    const cellSize = this.mazeGenerator.getCellSize();
    const mazeWidth = Math.floor(width / cellSize);
    const mazeHeight = Math.floor(height / cellSize);
    
    this.mazeGenerator.resize(mazeWidth, mazeHeight);
    this.startNewGame();
  }
  
  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}