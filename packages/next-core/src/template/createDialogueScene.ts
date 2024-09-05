import { Scene, Graphics, Text } from "../scene";

export function createDialogueScene() {
  const scene = new Scene();

  const dialogRect = new Graphics();
  dialogRect.alpha = 0.7;
  dialogRect.beginFill(0x000000);
  dialogRect.drawRect(0, 0, 1920, 400);
  dialogRect.endFill();
  dialogRect.x = 0;
  dialogRect.y = 680;

  const nameText = new Text("Name", {
    fill: 0xffffff,
    fontSize: 44,
    fontWeight: "bold",
  });
  nameText.x = 160;
  nameText.y = 700;

  const dialogText = new Text("Text: 一段话一段话", {
    fill: 0xffffff,
    wordWrap: true,
    breakWords: true,
    wordWrapWidth: 1600,
    fontSize: 38,
    leading: 15,
  });
  dialogText.x = 160;
  dialogText.y = 770;

  scene.addChild(dialogRect);
  scene.addChild(nameText);
  scene.addChild(dialogText);
  scene.config.speak = {
    target: {
      name: nameText.name,
      text: dialogText.name,
      dialog: dialogRect.name,
    },
  };

  return scene;
}