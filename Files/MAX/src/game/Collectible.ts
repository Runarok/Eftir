export default class Collectible {
  public x: number;
  public y: number;
  private radius: number;
  private theme: 'dark' | 'light';
  private pulseEffect: number = 0;
  
  constructor(x: number, y: number, radius: number, theme: 'dark' | 'light') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.theme = theme;
  }
  
  public draw(ctx: CanvasRenderingContext2D): void {
    // Update pulse effect
    this.pulseEffect = (this.pulseEffect + 0.05) % (Math.PI * 2);
    const pulseScale = 1 + Math.sin(this.pulseEffect) * 0.2;
    
    // Draw collectible
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulseScale, 0, Math.PI * 2);
    
    // Always visible with theme-appropriate colors
    if (this.theme === 'dark') {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
      ctx.shadowColor = 'rgba(234, 179, 8, 0.5)';
      ctx.shadowBlur = 5;
    }
    
    ctx.fill();
    
    // Reset shadow blur
    ctx.shadowBlur = 0;
    
    // Draw particles around collectible
    this.drawParticles(ctx);
  }
  
  private drawParticles(ctx: CanvasRenderingContext2D): void {
    const particleCount = 5;
    const particleRadius = this.radius / 4;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + this.pulseEffect;
      const distance = this.radius * 1.5;
      
      const particleX = this.x + Math.cos(angle) * distance;
      const particleY = this.y + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
      
      if (this.theme === 'dark') {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      } else {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
      }
      
      ctx.fill();
    }
  }
  
  public updateTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
  }
}