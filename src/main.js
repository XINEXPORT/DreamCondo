import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Load Sprites
k.loadSprite("sprite_pink", "/tilesets/sprite_pink.png");
k.loadSprite("sprite_teal", "/tilesets/sprite_teal.png");
k.loadSprite("xtra_teal", "/tilesets/xtra_teal.png");
k.loadSprite("blue", "/tilesets/blue.png");
k.loadSprite("map", "/map.png");


// spritesheet path
k.loadSprite("spritesheet", "/tilesets/sprite.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 1070,
    "walk-down": { from: 1070, to: 1071, loop: true, speed: 8 },

    "idle-side": 1071,
    "walk-side": { from: 1071, to: 1072, loop: true, speed: 8 },

    "idle-up": 1072,
    "walk-up": { from: 1072, to: 1073, loop: true, speed: 8 },
  },
});


k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([
    k.sprite("map"),
    k.pos(0, 0),            
    k.anchor("center"),     
    k.scale(scaleFactor),   
  ]);
  
  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(0, 0),
    k.scale(scaleFactor),
    { speed: 250, direction: "down", isInDialogue: false },
    "player",
  ]);
  

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            if (!player.isInDialogue) {
              player.isInDialogue = true;
              displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
            }
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoint") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
        }
      }
    }
  }

  setCamScale(k);
  k.onResize(() => setCamScale(k));

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    const direction = worldMousePos.sub(player.pos).unit();
    player.move(direction.scale(player.speed));

    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (mouseAngle > lowerBound && mouseAngle < upperBound) {
      player.play("walk-up");
      player.direction = "up";
    } else if (mouseAngle < -lowerBound && mouseAngle > -upperBound) {
      player.play("walk-down");
      player.direction = "down";
    } else if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      player.play("walk-side");
      player.direction = "right";
    } else if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      player.play("walk-side");
      player.direction = "left";
    }
  });

  function stopAnims() {
    const idleAnim = {
      down: "idle-down",
      up: "idle-up",
      left: "idle-side",
      right: "idle-side",
    };
    player.play(idleAnim[player.direction]);
  }

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);

  k.onKeyDown(() => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    if (keyMap.filter(Boolean).length > 1 || player.isInDialogue) return;

    const directions = ["right", "left", "up", "down"];
    const moves = [
      () => player.move(player.speed, 0),
      () => player.move(-player.speed, 0),
      () => player.move(0, -player.speed),
      () => player.move(0, player.speed),
    ];

    keyMap.forEach((pressed, i) => {
      if (pressed) {
        player.flipX = directions[i] === "left";
        player.play(`walk-${directions[i]}`);
        player.direction = directions[i];
        moves[i]();
      }
    });
  });
});

k.go("main");
