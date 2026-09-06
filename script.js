function setToggle(isOn){
    document.getElementById('toggleOn').classList.toggle('on', isOn);
    document.getElementById('toggleOff').classList.toggle('on', !isOn);
  }

  let textScale = 1;
  function resizeText(dir){
    textScale = Math.min(1.3, Math.max(0.85, textScale + dir * 0.08));
    document.body.style.fontSize = (16 * textScale) + 'px';
  }