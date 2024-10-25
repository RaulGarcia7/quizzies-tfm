import { playSound } from './SoundManager';
import buttonClickSound from '../assets/Sounds/button_click.wav';

export const createButtonHandler = async () => {
  try {
    await playSound(buttonClickSound);
  } catch (error) {
    console.error("Error al reproducir el sonido:", error);
  }
};
