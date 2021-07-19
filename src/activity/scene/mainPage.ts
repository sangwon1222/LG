import gsap from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";

export class MainPage extends SceneBase {
  private mBtnAry: Array<PIXI.Sprite>;
  constructor() {
    super("mainPage");
  }
  async onInit() {
    this.mBtnAry = [];
    const bg = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("main_bg.png").texture
    );
    this.addChild(bg);

    const contentsListPos = [{ x: 216, y: 360 }];
    /**ex> 이상한 손님, 마음이 퐁퐁퐁 , 등 컨텐츠 갯수대로 리스트 생성 */
    for (let i = 0; i < 1; i++) {
      const contents = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("main_btn.png").texture
      );
      this.addChild(contents);
      contents.anchor.set(0.5);
      contents.position.set(contentsListPos[i].x, contentsListPos[i].y);
      contents.interactive = true;
      contents.buttonMode = true;
      contents.on("pointertap", async () => {
        window["clickSnd"].play();
        gsap.delayedCall(window["clickSnd"].duration, async () => {
          await this.goScene("servePage", true);
        });
      });
      this.mBtnAry.push(contents);
    }
  }
  async onStart() {
    //
  }
}
