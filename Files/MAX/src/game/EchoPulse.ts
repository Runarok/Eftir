export default class EchoPulse {
  public x: number;
  public y: number;
  public radius: number;
  public maxRadius: number;
  private expandSpeed: number;
  private theme: 'dark' | 'light';
  
  constructor(x: number, y: number, radius: number, theme: 'dark' | 'light') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.maxRadius = 300;
    this.expandSpeed = 0.2;
    this.theme = theme;
  }
  
  public update(deltaTime: number): void {
    // Expand the pulse
    this.radius += this.expandSpeed * deltaTime;
  }
  
  public draw(ctx: CanvasRenderingContext2D): void {
    // Calculate opacity based on radius (fade out as it expands)
    const opacity = Math.max(0, 1 - this.radius / this.maxRadius);
    
    // Create gradient
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    
    if (this.theme === 'dark') {
      gradient.addColorStop(0, `rgba(120, 87, 255, 0)`);
      gradient.addColorStop(0.5, `rgba(120, 87, 255, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(120, 87, 255, 0)`);
    } else {
      gradient.addColorStop(0, `rgba(59, 130, 246, 0)`);
      gradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
    }
    
    // Draw the pulse
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw the pulse edge
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.theme === 'dark' 
      ? `rgba(180, 160, 255, ${opacity})` 
      : `rgba(59, 130, 246, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  public updateTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
  }
}