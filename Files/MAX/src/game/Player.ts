import { Cell, CellType } from '../types/game';

export default class Player {
  public x: number;
  public y: number;
  private radius: number;
  private theme: 'dark' | 'light';
  private isMoving: boolean = false;
  private targetX: number;
  private targetY: number;
  private moveSpeed: number = 8;
  
  constructor(x: number, y: number, radius: number, theme: 'dark' | 'light') {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.radius = radius;
    this.theme = theme;
  }
  
  public draw(ctx: CanvasRenderingContext2D): void {
    // Update position if moving
    if (this.isMoving) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > this.moveSpeed) {
        this.x += (dx / distance) * this.moveSpeed;
        this.y += (dy / distance) * this.moveSpeed;
      } else {
        this.x = this.targetX;
        this.y = this.targetY;
        this.isMoving = false;
      }
    }
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    ctx.fillStyle = this.theme === 'dark' ? '#f0f0ff' : '#3b82f6';
    ctx.fill();
    
    if (this.theme === 'dark') {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(180, 180, 255, 1)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.stroke();
    }
  }
  
  public move(dx: number, dy: number, maze: Cell[][], cellSize: number): boolean {
    if (this.isMoving) return false;
    
    const currentCellX = Math.floor(this.x / cellSize);
    const currentCellY = Math.floor(this.y / cellSize);
    const newCellX = currentCellX + dx;
    const newCellY = currentCellY + dy;
    
    // Check if the new cell is within bounds and not a wall
    if (newCellX >= 0 && newCellX < maze[0].length &&
        newCellY >= 0 && newCellY < maze.length &&
        maze[newCellY][newCellX].type !== CellType.WALL) {
      
      this.targetX = newCellX * cellSize + cellSize / 2;
      this.targetY = newCellY * cellSize + cellSize / 2;
      this.isMoving = true;
      return true;
    }
    
    return false;
  }
  
  public isCurrentlyMoving(): boolean {
    return this.isMoving;
  }
  
  public getCurrentCell(cellSize: number): { x: number, y: number } {
    return {
      x: Math.floor(this.x / cellSize),
      y: Math.floor(this.y / cellSize)
    };
  }
  
  public updateTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
  }
}