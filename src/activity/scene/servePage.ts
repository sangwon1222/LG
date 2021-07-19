import gsap, { Power0 } from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";

export class ServePage extends SceneBase {
  private mPlayBtn: PIXI.Sprite;
  constructor() {
    super("servePage");
  }
  async onInit() {
    const bg = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("serve_bg.png").texture
    );
    this.mPlayBtn = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("serve_play_btn.png").texture
    );
    this.mPlayBtn.anchor.set(0.5);
    this.mPlayBtn.position.set(1074, 178);

    const backKey = new PIXI.Graphics();
    backKey.beginFill(0x00ff00, 0.1);
    backKey.drawRect(0, 0, 300, 80);
    backKey.endFill();
    backKey.interactive = true;
    backKey.buttonMode = true;
    backKey.alpha = 0;
    backKey.on("pointertap", () => {
      location.reload();
    });

    this.addChild(bg, this.mPlayBtn, backKey);
  }
  async onStart() {
    this.mPlayBtn.interactive = true;
    this.mPlayBtn.buttonMode = true;

    this.mPlayBtn.angle = 5;
    gsap
      .to(this.mPlayBtn, { angle: -5, duration: 0.5, ease: Power0.easeNone })
      .repeat(-1)
      .yoyo(true);

    this.mPlayBtn.on("pointertap", async () => {
      // const bgm = ResourceManager.Handle.getCommon("bgm.mp3").sound;
      // bgm.volume = 1;
      // bgm.play();
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, async () => {
        await this.goScene("page1", true);
      });
    });
  }
}
