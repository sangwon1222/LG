import gsap, { Power0 } from "gsap/all";
import { Rectangle } from "pixi.js";
import { LgApp } from "../core/app";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { getPos } from "../utill/gameUtil";
import { DeepPressAffor } from "../widget/deepPressAffor";
import { DirectionAffor } from "../widget/directionAffor";

export class Page3 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mDeepPressAffor: DeepPressAffor;
  private mDirectionAffor: DirectionAffor;

  private mPressTime: any;
  private mPressFlag: boolean;
  private mPressSnd: PIXI.sound.Sound;
  private mCircleTimer: PIXI.spine.Spine;

  private mWind: PIXI.Sprite;
  private mFlyingObject: Array<PIXI.Sprite>;

  private mCha: PIXI.spine.Spine;
  constructor() {
    super("page3");
  }
  async onInit() {
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page3.png").texture
    );

    // 방구이미지
    this.mWind = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("3_wind.png").texture
    );
    this.mWind.position.set(400, 0);
    this.mWind.alpha = 0;

    this.sortableChildren = true;

    await this.createObject();
  }

  async onStart() {
    this.mPressFlag = false;
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registDragEvent();
      }
    };
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    this.mCha.state.setAnimation(0, "3_1", true);
    await this.registEvent();
  }

  async registEvent() {
    this.mPressSnd = ResourceManager.Handle.getCommon("03_sfx_2.mp3").sound;

    this.mDeepPressAffor = new DeepPressAffor();
    this.addChild(this.mDeepPressAffor);
    this.mDeepPressAffor.position.set(396, 592);
    this.mDeepPressAffor.zIndex = 6;
    await this.mDeepPressAffor.start();

    this.mCha.interactive = true;
    this.mCha.buttonMode = true;

    this.mCircleTimer = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("timer_3sec.json").spineData
    );
    this.mCircleTimer.zIndex = 4;
    this.addChild(this.mCircleTimer);
    this.mCircleTimer.position.set(
      this.mDeepPressAffor.x,
      this.mDeepPressAffor.y
    );

    this.mCircleTimer.visible = false;

    this.mCha
      .on("pointerdown", () => {
        this.mPressSnd.play();
        this.mPressFlag = true;
        // this.mAffordance.state.setAnimation(0, "animation", false);
        this.mDeepPressAffor.visible = false;
        this.mCircleTimer.visible = true;
        this.mCircleTimer.state.setAnimation(0, "animation", false);
        this.mCircleTimer.state.timeScale = 1.7;

        window["clickSnd"].play();
        this.mCha.state.timeScale = 0.6;
        this.mCha.state.setAnimation(0, "3_2", false);
        this.mPressTime = gsap.delayedCall(2, async () => {
          if (this.mPressFlag) {
            this.mCha.interactive = false;
            this.mCha.buttonMode = false;
            await this.registDragEvent();
          }
        });
      })
      .on("pointerup", async () => {
        await this.canclePress();
      })
      .on("pointerout", async () => {
        await this.canclePress();
      });
  }

  async canclePress() {
    this.mPressSnd.stop();
    this.mCircleTimer.visible = false;
    this.mDeepPressAffor.visible = true;
    if (this.mPressFlag) {
      this.mCha.state.setAnimation(0, "3_1", true);
      await this.mDeepPressAffor.start();
    }
    if (this.mPressTime) {
      this.mPressTime.kill();
      this.mPressFlag = false;
    }
  }

  async registDragEvent() {
    await this.mDeepPressAffor.endAffor();
    this.removeChild(this.mCircleTimer, this.mDeepPressAffor);
    ResourceManager.Handle.getCommon("08_sfx_1.mp3").sound.play();
    this.mCha.state.setAnimation(0, "3_3", true);
    this.mCha.state.timeScale = 1;

    await this.dragAffor();

    const dragRect = new PIXI.Graphics();
    dragRect.beginFill(0x000000, 1);
    dragRect.drawRect(0, 0, config.w, config.h);
    dragRect.endFill();
    dragRect.position.set(0, 0);
    dragRect.alpha = 0;
    dragRect.zIndex = 6;

    dragRect.interactive = true;
    dragRect.buttonMode = true;

    let flag = false;
    let startX = 0;
    let endX = 0;
    dragRect
      .on("pointerdown", (evt: PIXI.InteractionEvent) => {
        flag = true;
        startX = evt.data.global.x;

        this.mDirectionAffor.visible = false;
      })
      .on("pointerup", async (evt: PIXI.InteractionEvent) => {
        endX = evt.data.global.x;

        if (flag) {
          if (endX - startX > 100) {
            dragRect.interactive = false;
            dragRect.buttonMode = false;
            await this.mDirectionAffor.endAffor();
            this.removeChild(dragRect, this.mDirectionAffor);
            await this.startFrying();
          } else {
            this.mDirectionAffor.visible = true;
          }
        }

        flag = false;
      })
      .on("pointerout", async (evt: PIXI.InteractionEvent) => {
        endX = evt.data.global.x;

        if (flag) {
          if (endX - startX > 100) {
            dragRect.interactive = false;
            dragRect.buttonMode = false;
            await this.mDirectionAffor.endAffor();
            this.removeChild(dragRect, this.mDirectionAffor);
            await this.startFrying();
          } else {
            this.mDirectionAffor.visible = true;
          }
        }

        flag = false;
      });

    this.addChild(dragRect);
  }

  async dragAffor() {
    this.mDirectionAffor = new DirectionAffor();
    this.mDirectionAffor.zIndex = 4;
    this.mDirectionAffor.position.set(420, 520);
    await this.mDirectionAffor.start(200, -160, 2);

    this.addChild(this.mDirectionAffor);
  }

  // 효과음 + 모션
  async startFrying() {
    ResourceManager.Handle.getCommon("03_sfx_1.mp3").sound.play({
      loop: true,
    });

    this.mCha.state.timeScale = 0.7;
    this.mCha.state.setAnimation(0, "3_4", true);
    const windMotion = gsap.timeline({ repeat: -1, ease: Power0.easeNone });
    windMotion.to(this.mWind, {
      alpha: 1,
      duration: 1,
    });
    windMotion.to(this.mWind, {
      alpha: 1,
      duration: 1,
    });
    windMotion.to(this.mWind, {
      alpha: 0,
      duration: 1,
    });

    for (let i = 0; i < this.mFlyingObject.length; i++) {
      const object = this.mFlyingObject[i];
      const moveX = 140;
      let moveY = 200;
      let moveAngle = 30;
      // 냄비 그림자
      if (i == 3) {
        moveY = 60;
        moveAngle = 15;
      }
      // 소년
      if (i == 0) {
        moveY = 120;
        moveAngle = 15;
      }
      const flyingObject = gsap.timeline({
        repeat: -1,
        ease: Power0.easeNone,
      });
      flyingObject.to(object, {
        angle: moveAngle,
        x: object.x + moveX,
        y: object.y - moveY,
        duration: 1,
      });
      flyingObject.to(object, {
        angle: moveAngle,
        x: object.x + moveX,
        y: object.y - moveY,
        duration: 1,
      });
      flyingObject.to(object, {
        angle: 0,
        x: object.x,
        y: object.y,
        duration: 1,
      });
    }

    gsap.delayedCall(6, async () => {
      await this.goScene("page4");
    });
  }

  createObject(): Promise<void> {
    return new Promise<void>((resolve) => {
      // 날라가는 물체
      this.mFlyingObject = [];

      const list = ["boy", "dish", "pot", "pot_sh", "spoon1", "spoon2"];
      const listPos = [
        { x: 260, y: 120 },
        { x: -20, y: 220 },
        { x: 900, y: 610 },
        { x: 900, y: 700 },
        { x: 1000, y: 280 },
        { x: 920, y: 200 },
      ];

      for (let i = 0; i < list.length; i++) {
        const object = new PIXI.Sprite(
          ResourceManager.Handle.getCommon(`3_${list[i]}.png`).texture
        );
        object.position.set(listPos[i].x, listPos[i].y);
        this.addChild(object);
        object.zIndex = 2;
        this.mFlyingObject.push(object);
      }

      // 방귀뀌는 캐릭터
      this.mCha = new PIXI.spine.Spine(
        ResourceManager.Handle.getCommon("3_p_motion.json").spineData
      );
      this.mCha.stateData.defaultMix = 0.5;
      this.mCha.position.set(664, 444);

      this.addChild(this.mBG, this.mWind, this.mCha);

      this.mBG.zIndex = 1;
      this.mWind.zIndex = 2;
      this.mCha.zIndex = 3;

      resolve();
    });
  }
}
