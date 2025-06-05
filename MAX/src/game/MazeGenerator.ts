import { Cell, CellType, Position } from '../types/game';

export default class MazeGenerator {
  private width: number;
  private height: number;
  private cellSize: number;
  private startPosition: Position = { x: 0, y: 0 };
  private exitPosition: Position = { x: 0, y: 0 };
  
  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
  }
  
  public generate(): Cell[][] {
    // Create empty grid filled with walls
    const maze: Cell[][] = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(null).map(() => ({ 
        type: CellType.WALL, 
        visible: 0 
      }))
    );
    
    // Use recursive backtracking to generate the maze
    this.generateMaze(maze, 1, 1);
    
    // Set start position (usually in the top-left area)
    this.setStartPosition(maze);
    
    // Set exit position (usually in the bottom-right area)
    this.setExitPosition(maze);
    
    return maze;
  }
  
  private generateMaze(maze: Cell[][], x: number, y: number): void {
    // Mark current cell as path
    maze[y][x] = { type: CellType.PATH, visible: 0 };
    
    // Define possible directions to move (randomized)
    const directions = this.shuffleDirections();
    
    // Try each direction
    for (const [dx, dy] of directions) {
      // Calculate new position (2 cells away to leave walls between paths)
      const newX = x + dx * 2;
      const newY = y + dy * 2;
      
      // Check if new position is valid and still a wall
      if (this.isValidPosition(newX, newY) && maze[newY][newX].type === CellType.WALL) {
        // Carve path by making the wall between current and new position a path
        maze[y + dy][x + dx] = { type: CellType.PATH, visible: 0 };
        
        // Recursive call for the new position
        this.generateMaze(maze, newX, newY);
      }
    }
  }
  
  private shuffleDirections(): [number, number][] {
    const directions: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // Up, Right, Down, Left
    
    // Fisher-Yates shuffle
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    return directions;
  }
  
  private isValidPosition(x: number, y: number): boolean {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
  }
  
  private setStartPosition(maze: Cell[][]): void {
    // Try to find a path cell in the top-left quarter
    const quarterWidth = Math.floor(this.width / 4);
    const quarterHeight = Math.floor(this.height / 4);
    
    for (let y = 1; y < quarterHeight; y++) {
      for (let x = 1; x < quarterWidth; x++) {
        if (maze[y][x].type === CellType.PATH) {
          this.startPosition = { x, y };
          return;
        }
      }
    }
    
    // Fallback: find any path cell
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (maze[y][x].type === CellType.PATH) {
          this.startPosition = { x, y };
          return;
        }
      }
    }
  }
  
  private setExitPosition(maze: Cell[][]): void {
    // Try to find a path cell in the bottom-right quarter
    const threeQuarterWidth = Math.floor(this.width * 3 / 4);
    const threeQuarterHeight = Math.floor(this.height * 3 / 4);
    
    for (let y = this.height - 2; y >= threeQuarterHeight; y--) {
      for (let x = this.width - 2; x >= threeQuarterWidth; x--) {
        if (maze[y][x].type === CellType.PATH) {
          this.exitPosition = { x, y };
          return;
        }
      }
    }
    
    // Fallback: find any path cell in the bottom half
    for (let y = this.height - 2; y >= Math.floor(this.height / 2); y--) {
      for (let x = this.width - 2; x >= 0; x--) {
        if (maze[y][x].type === CellType.PATH) {
          this.exitPosition = { x, y };
          return;
        }
      }
    }
  }
  
  public getStartPosition(): Position {
    return this.startPosition;
  }
  
  public getExitPosition(): Position {
    return this.exitPosition;
  }
  
  public getCellSize(): number {
    return this.cellSize;
  }
  
  public getEmptyPositions(): Position[] {
    const positions: Position[] = [];
    
    // Create a new maze to find empty positions
    const maze = this.generate();
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (maze[y][x].type === CellType.PATH) {
          // Don't include start or exit positions
          if ((x !== this.startPosition.x || y !== this.startPosition.y) &&
              (x !== this.exitPosition.x || y !== this.exitPosition.y)) {
            positions.push({ x, y });
          }
        }
      }
    }
    
    return positions;
  }
  
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}