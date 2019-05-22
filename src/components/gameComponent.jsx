import React from 'react'
import Game from '../game'

class GameComponent extends React.Component {
  render () {
    var component = this;
    return (
      <canvas ref={(thisCanvas) => {
        component.canvas = thisCanvas;
      }} />
    );
  }
  componentDidMount () {
    var game = new Game(this.canvas,640,480);
    game.runGame();
  }
}

export default GameComponent;
