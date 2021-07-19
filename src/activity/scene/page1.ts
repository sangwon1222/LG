import gsap, { Power0 } from "gsap/all";
import { LgApp } from "../core/app";
import { Loading } from "../core/loading";
import { page1RscList } from "../core/resource/viewer/page1RscList";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { getPos } from "../utill/gameUtil";

export class Page1 extends SceneBase {
  private mTitle: PIXI.Sprite;
  private mWhiter: PIXI.Sprite;
  private mCharactor: PIXI.spine.Spine;

  private mEffectSnd: PIXI.sound.Sound;
  private mWhiterSnd: PIXI.sound.Sound;
  constructor() {
    super("page1");
  }
  async onInit() {
    this.removeChildren();

    const bg = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page1.png").texture
    );

    this.addChild(bg);
  }

  async onStart() {
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registEvent();
      }
    };
    if (window["bgm"].paused) window["bgm"].play({ loop: true });

    this.mEffectSnd = ResourceManager.Handle.getCommon("01_sfx_1.mp3").sound;
    this.mWhiterSnd = ResourceManager.Handle.getCommon("01_nar_1.mp3").sound;

    this.createBackground();
    this.showTitle();
    await this.clickTitle(true);
    this.mTitle.interactive = true;
    this.mTitle.on("pointertap", () => {
      this.clickTitle();
    });

    await this.registEvent();
  }

  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(1076, 513);
    affordance.state.setAnimation(0, "animation", true);
    // getPos(affordance);

    this.mCharactor.interactive = true;
    this.mCharactor.buttonMode = true;

    this.mCharactor.once("pointertap", async () => {
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, () => {
        this.playTitleSnd();
        this.removeChild(affordance);
        affordance = null;
        this.mCharactor.interactive = false;
        this.mCharactor.buttonMode = false;
        this.mCharactor.state.setAnimation(0, "1_2", false);
        this.mCharactor.state.addListener({
          complete: async (event) => {
            const name = event.animation.name;
            if (name == "1_2") {
              this.mCharactor.state.setAnimation(0, "1_3", true);
              gsap.delayedCall(2, async () => {
                await this.goScene("page2");
              });
            }
          },
        });
      });
    });
  }

  createBackground() {
    this.mCharactor = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("1_p_motion.json").spineData
    );
    this.addChild(this.mCharactor);

    this.mCharactor.position.set(640, 400);
    this.mCharactor.stateData.defaultMix = 0.25;
    this.mCharactor.state.setAnimation(0, "1_1", true);
  }

  showTitle() {
    this.mTitle = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page1_title.png").texture
    );
    this.mTitle.position.set(704, 50);

    const titleMask = new PIXI.Graphics();
    titleMask.beginFill(0x000000, 1);
    titleMask.drawRoundedRect(0, 0, this.mTitle.width, this.mTitle.height, 100);
    titleMask.endFill();
    titleMask.position.set(704 - 200, 50 - 200);

    this.mWhiter = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page1_writer.png").texture
    );
    this.mWhiter.position.set(906, 158);

    const whiterMask = new PIXI.Graphics();
    whiterMask.beginFill(0x000000, 1);
    whiterMask.drawRoundedRect(
      0,
      0,
      this.mWhiter.width,
      this.mWhiter.height,
      100
    );
    whiterMask.endFill();
    whiterMask.position.set(906 - 100, 158 - 100);

    this.addChild(titleMask, whiterMask, this.mTitle, this.mWhiter);
    this.mTitle.mask = titleMask;
    this.mWhiter.mask = whiterMask;

    // 글자 나오는 모션
    gsap.to(titleMask, { x: 704, y: 50, duration: 1 }).delay(1);
    gsap.to(whiterMask, { x: 906, y: 158, duration: 1 }).delay(1.8);
  }

  playTitleSnd(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mEffectSnd.play();
      gsap.delayedCall(this.mEffectSnd.duration, () => {
        resolve();
      });
    });
  }

  clickTitle(first?: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mEffectSnd.pause();
      this.mWhiterSnd.pause();
      if (first) {
        // 사운드 차례대로 재생
        gsap.delayedCall(1, () => {
          this.mEffectSnd.play();
        });
        gsap.delayedCall(2, () => {
          this.mWhiterSnd.play();
          gsap.delayedCall(this.mWhiterSnd.duration, () => {
            resolve();
          });
        });
      } else {
        this.mWhiterSnd.play();
        resolve();
      }
    });
  }
}
