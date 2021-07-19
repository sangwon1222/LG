import gsap, { Power0, SteppedEase } from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { getColorByPoint, getPos } from "../utill/gameUtil";

export class Page2 extends SceneBase {
  private mBG: PIXI.Sprite;

  private mDoor: PIXI.spine.Spine;

  private mTitleMask: PIXI.Graphics;
  private mTitleSprite: PIXI.Sprite;

  private mDoorSnd: PIXI.sound.Sound;
  private mTitleSnd: PIXI.sound.Sound;

  constructor() {
    super("page2");
  }
  async onInit() {
    this.removeChildren();
    // 배경 이미지
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page2.png").texture
    );
    this.addChild(this.mBG);

    // 닫힌 문짝
    const door = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("2_door_close.png").texture
    );
    door.anchor.set(0.5);
    door.position.set(964 + door.width / 2 - 10, -10 + door.height / 2);

    const boy = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("2_cha_head.png").texture
    );
    boy.anchor.set(0.5);
    boy.position.set(door.x - 70, door.y + 52);
    this.mBG.addChild(boy, door);
    // gsap.to(boy, { x: door.x - 80, duration: 0.5 }).delay(0.5);

    // (문 + 빼꼼하는 소년) 스파인
    this.mDoor = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("2_p_motion.json").spineData
    );
    this.mDoor.position.set(636, 400);
    // this.mBG.addChild(this.mDoor);
  }

  async onStart() {
    this.mBG.removeChildren();
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registEvent();
      }
    };
    this.mTitleSnd = ResourceManager.Handle.getCommon("02_nar_1.mp3").sound;
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    this.mBG.removeChildren();
    this.mTitleSprite = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page2_title.png").texture
    );
    this.mTitleSprite.position.set(640 - 100, 340);

    // 읽어주는 타이틀에 씌울 마스크
    this.mTitleMask = new PIXI.Graphics();
    this.mTitleMask.beginFill(0x000000, 1);
    this.mTitleMask.drawRect(0, 0, this.mTitleSprite.width, 24);
    this.mTitleMask.endFill();
    this.mTitleMask.position.set(640 - 358 - 140, 340);

    this.mTitleSprite.mask = this.mTitleMask;

    this.mBG.addChild(this.mDoor, this.mTitleSprite, this.mTitleMask);
    this.mDoorSnd = ResourceManager.Handle.getCommon("02_sfx_1.mp3").sound;
    this.mDoorSnd.play();
    this.mDoor.stateData.defaultMix = 0.5;
    this.mDoor.state.setAnimation(0, "2_1", true);
    await this.showTitle();
    this.mTitleSprite.interactive = true;
    this.mTitleSprite.buttonMode = true;
    this.mTitleSprite.on("pointertap", async () => {
      await this.playTitleSnd();
    });
    await this.registEvent();
  }

  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(994, 396);
    affordance.state.setAnimation(0, "animation", true);

    this.mDoor.interactive = true;
    this.mDoor.buttonMode = true;

    this.mDoor.on("pointertap", async () => {
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, async () => {
        this.mDoorSnd.play();
        this.removeChild(affordance);
        affordance = null;
        this.mDoor.interactive = false;
        await this.openDoor();
        await this.goScene("page3");
      });
    });
  }

  showTitle(): Promise<void> {
    return new Promise<void>((resolve) => {
      gsap.delayedCall(1, () => {
        this.mTitleSnd.play();
        gsap.to(this.mTitleMask, {
          alpha: 1,
          x: 640 - 100,
          duration: this.mTitleSnd.duration - 1.5,
          ease: Power0.easeNone,
          // ease: SteppedEase.config(14),
        });
        gsap.delayedCall(this.mTitleSnd.duration, () => {
          resolve();
        });
      });
    });
  }

  playTitleSnd(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mTitleSnd.stop();
      this.mTitleSnd.play();
      gsap.delayedCall(this.mTitleSnd.duration, () => {
        resolve();
      });
    });
  }

  openDoor(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mDoor.state.setAnimation(0, "2_2", false);
      gsap.delayedCall(1, () => {
        this.mDoor.state.setAnimation(0, "2_3", true);
      });
      gsap.delayedCall(3, () => {
        resolve();
      });
    });
  }
}
