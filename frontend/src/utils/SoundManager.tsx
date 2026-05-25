// Essa variável começa como true (ligada) por padrão
export let isSoundEnabled = true;

// Essa função será chamada pelo botão na tela de configurações
export const toggleSoundEffects = (enabled: boolean) => {
  isSoundEnabled = enabled;
};