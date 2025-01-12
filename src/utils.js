export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
  
    dialogueUI.style.display = "block";
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        dialogue.innerHTML = currentText;
        index++;
        return;
      }
  
      clearInterval(intervalRef);
    }, 1);
  
    const closeBtn = document.getElementById("close");
  
    function onCloseBtnClick() {
      onDisplayEnd();
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      clearInterval(intervalRef);
      closeBtn.removeEventListener("click", onCloseBtnClick);
    }
  
    closeBtn.addEventListener("click", onCloseBtnClick);
  
    addEventListener("keypress", (key) => {
      if (key.code === "Enter") {
        closeBtn.click();
      }
    });
  }
  
  export function setCamScale(k) {
    k.camScale(1);  
  
    k.onUpdate(() => {
      const mouseWorldPos = k.toWorld(k.mousePos());  
      const camSpeed = 0.05;                          
  
      const newCamPos = k.camPos().lerp(mouseWorldPos, camSpeed);
      k.camPos(newCamPos);
    });
  }
  
