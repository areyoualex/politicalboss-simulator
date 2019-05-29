export function setupInput () {
  window.addEventListener('keydown', (e)=>{
    if(e.repeat) return; //Reject repeated input

    //Add input listeners
    if(e.key === 'ArrowUp' || e.key === 'w')
      {
        this.sprites.player.play();
        this.input.up = true;
      }
    if(e.key === 'ArrowDown' || e.key === 's')
      {
        this.sprites.player.play();
        this.input.down = true;
      }
    if(e.key === 'ArrowLeft' || e.key === 'a')
      {
        this.sprites.player.play();
        this.sprites.player.scale.x = -1;
        this.sprites.player.anchor.set(1,0);
        this.input.left = true;
      }
    if(e.key === 'ArrowRight' || e.key === 'd')
      {
        this.sprites.player.play();
        this.sprites.player.scale.x = 1;
        this.sprites.player.anchor.set(0);
        this.input.right = true;
      }
  });
  window.addEventListener('keyup', (e)=>{
    //Add input listeners
    if(e.key === 'ArrowUp' || e.key === 'w')
      {
        this.sprites.player.stop();
        this.input.up = false;
      }
    if(e.key === 'ArrowDown' || e.key === 's')
      {
        this.sprites.player.stop();
        this.input.down = false;
      }
    if(e.key === 'ArrowLeft' || e.key === 'a')
      {
        this.sprites.player.stop();
        this.input.left = false;
      }
    if(e.key === 'ArrowRight' || e.key === 'd')
      {
        this.sprites.player.stop();
        this.input.right = false;
      }
  });
};
