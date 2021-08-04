import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import { InteractionEvent, resources } from "pixi.js";
// import { util } from "vue/types/umd";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { debugLine } from "../utill/gameUtil";
import { Timer } from "../widget/Timer";

export class AnswerBox extends PIXI.Sprite {
  private mDragFlag: boolean;
  get dragFlag(): boolean {
    return this.mDragFlag;
  }
  set dragFlag(v: boolean) {
    this.mDragFlag = v;
  }

  private mBackupPos: { x: number; y: number };
  get backupPos(): { x: number; y: number } {
    return this.mBackupPos;
  }
  set backupPos(v: { x: number; y: number }) {
    this.mBackupPos = v;
  }

  constructor(idx: number) {
    super();
    this.mBackupPos = { x: 0, y: 0 };
    this.texture = ResourceManager.Handle.getCommon(
      `activity2_ex${idx}.png`
    ).texture;
    this.anchor.set(0.5);

    this.mDragFlag = false;
    this.interactive = false;

    this.on("pointerdown", () => {
      this.mDragFlag = true;
      this.onPointerdown();
    })
      .on("pointermove", (evt: PIXI.InteractionEvent) => {
        if (this.mDragFlag) this.onPointermove(evt);
      })
      .on("pointerup", (evt: PIXI.InteractionEvent) => {
        this.mDragFlag = false;
        this.onPointerUp(evt);
      })
      .on("pointerout", () => {
        // this.mDragFlag = false;
        this.onPointerout();
      })
      .on("pointerupoutside", (evt: PIXI.InteractionEvent) => {
        this.mDragFlag = false;
        this.onPointerUp(evt);
      });
  }

  onPointerdown() {
    //
  }

  onPointermove(evt: PIXI.InteractionEvent) {
    //
  }

  onPointerUp(evt: PIXI.InteractionEvent) {
    //
  }

  onPointerout() {
    //
  }
}

export class Page11 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mTitleSp: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;
  private mFingerSp: PIXI.Sprite;
  private mAnswerBoxAry: Array<AnswerBox>;
  private mQuestAry: Array<number>;
  private mTimeOutHnd: Timer;
  private mAniTimeLine: any;
  private mAffodunce: boolean;
  private mClear: boolean;
  constructor() {
    super("page11");
  }
  async onInit() {
    this.removeChildren();
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await this.goScene("page12");
      }
    };
    this.sortableChildren = true;
    this.mAnswerBoxAry = [];
    this.mQuestAry = [0, 0, 0, 0];
    this.mAffodunce = false;
    this.mClear = false;

    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("activity2_bg.png").texture
    );
    this.addChild(this.mBG);

    this.mTitleSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("activity2_question.png").texture
    );
    this.mTitleSp.anchor.set(0.5);
    this.mTitleSp.position.set(640, 72);
    this.addChild(this.mTitleSp);

    const tCorrectIdxAry = [3, 0, 2, 1];
    const tHitAreaAry = [];
    for (let i = 0; i < 4; i++) {
      const tQuestSpeaker = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("speaker.png").texture
      );
      tQuestSpeaker.anchor.set(0.5);
      tQuestSpeaker.position.set(253 * i + 261, 310);
      this.addChild(tQuestSpeaker);

      tQuestSpeaker.interactive = true;
      tQuestSpeaker.buttonMode = true;
      tQuestSpeaker.on("pointertap", () => {
        pixiSound.stopAll();
        const tQuestSnd = ResourceManager.Handle.getCommon(
          `02_activity_${2 + i}.mp3`
        ).sound;
        tQuestSnd.play();
      });

      const tQuestSp = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(
          `activity2_correct${tCorrectIdxAry[i] + 1}.png`
        ).texture
      );
      tQuestSp.anchor.set(0.5);
      tQuestSp.position.set(253 * i + 261, 310);
      this.addChild(tQuestSp);
      tQuestSp.alpha = 0;
      tQuestSp.hitArea = new PIXI.Rectangle(
        tQuestSp.x - tQuestSp.width / 2,
        tQuestSp.y - tQuestSp.height / 2,
        tQuestSp.width,
        tQuestSp.height
      );
      tHitAreaAry[tCorrectIdxAry[i]] = tQuestSp;
    }

    const tCorrectSnd = ResourceManager.Handle.getCommon("correct.mp3").sound;
    const tWrongSnd = ResourceManager.Handle.getCommon("wrong.mp3").sound;

    for (let i = 0; i < 4; i++) {
      const tAnswerBoxSp = new AnswerBox(i + 1);
      tAnswerBoxSp.position.set(253 * i + 261, 613.5);
      this.addChild(tAnswerBoxSp);

      tAnswerBoxSp.interactive = true;
      tAnswerBoxSp.buttonMode = true;
      tAnswerBoxSp.backupPos = {
        x: tAnswerBoxSp.position.x,
        y: tAnswerBoxSp.position.y,
      };

      tAnswerBoxSp.onPointerdown = () => {
        tAnswerBoxSp.zIndex = 10;
        this.hideFingerGuide();
      };

      tAnswerBoxSp.onPointermove = (evt: PIXI.InteractionEvent) => {
        const point = evt.data.getLocalPosition(this) as PIXI.Point;
        // evt.stopPropagation();
        // const x = evt.data.global.x;
        // const y = evt.data.global.y;
        // tAnswerBoxSp.position.set(x, y);
        tAnswerBoxSp.position.set(point.x, point.y);
      };

      tAnswerBoxSp.onPointerUp = (evt: PIXI.InteractionEvent) => {
        tAnswerBoxSp.zIndex = 0;
        const x = evt.data.global.x;
        const y = evt.data.global.y;
        // const x = tAnswerBoxSp.toLocal(evt.data.global).x;
        // const y = tAnswerBoxSp.toLocal(evt.data.global).y;

        if (tHitAreaAry[i].hitArea.contains(x, y)) {
          tCorrectSnd.play();
          tHitAreaAry[i].alpha = 1;
          tAnswerBoxSp.visible = false;
          this.mQuestAry[i] = 1;
          this.clearCheck();
        } else {
          tWrongSnd.play();
          tAnswerBoxSp.position.set(
            tAnswerBoxSp.backupPos.x,
            tAnswerBoxSp.backupPos.y
          );
        }

        this.startTimeOut(5, true);
      };
      this.mAnswerBoxAry[i] = tAnswerBoxSp;
    }

    this.mFingerSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("affordance.png").texture
    );
    this.mFingerSp.anchor.set(0.5, 0);
    this.addChild(this.mFingerSp);
    this.mFingerSp.visible = false;
    this.mFingerSp.zIndex = 10;
  }

  async onStart() {
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    //이미지 아래 설명 글
    const tTitleSnd = ResourceManager.Handle.getCommon("02_activity_1.mp3")
      .sound;
    tTitleSnd.play();

    this.mTitleSp.on("pointertap", (evt: InteractionEvent) => {
      pixiSound.stopAll();
      tTitleSnd.play();
    });

    gsap.delayedCall(tTitleSnd.duration, () => {
      if (this.mClear) return;
      this.startTimeOut(5, true);
    });
  }

  // 액티비티 완료 체크를 나타낸다.
  private clearCheck() {
    let tClear = true;

    for (const tVal of this.mQuestAry) {
      if (tVal === 0) tClear = false;
    }
    if (tClear) this.onClearMove();
  }

  //완료후 다음 페이지로 이동 버튼 활성화를 나타낸다.
  async onClearMove() {
    this.hideFingerGuide();
    this.mClear = true;

    this.mNextBtn = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("popup_next_btn.png").texture
    );
    this.mNextBtn.anchor.set(0.5);
    this.mNextBtn.position.set(1189, 402);
    this.addChild(this.mNextBtn);

    this.mNextBtn.interactive = true;
    this.mNextBtn.buttonMode = true;
    this.mNextBtn.on("pointertap", (evt: InteractionEvent) => {
      this.goScene("page12");
    });
    this.mNextBtn.alpha = 0;
    gsap.to(this.mNextBtn, {
      alpha: 1,
      duration: 0.5,
      repeatDelay: 0.5,
      yoyo: true,
      repeat: -1,
    });
  }

  // 10초마다 손가락 디렉션 보여주기를 나타낸다.
  private startTimeOut(tTime: number, tStart?: boolean) {
    if (this.mTimeOutHnd !== null) {
      this.mTimeOutHnd?.clear();
      this.mTimeOutHnd = null;
    }
    this.mAffodunce = true;

    this.mTimeOutHnd = new Timer(() => {
      this.showFingerGuide();
    }, 1000 * tTime);
  }

  private async showFingerGuide() {
    if (this.mFingerSp === null) return;
    if (this.mAffodunce === false) return;
    if (this.mClear) return;

    let tPosX = 0;
    const tPosY = 600;
    let tIdx = 0;
    for (let i = 0, tMax = this.mQuestAry.length; i < tMax; i++) {
      if (this.mQuestAry[i] === 0) {
        tIdx = i;
        break;
      }
    }

    tPosX = this.mAnswerBoxAry[tIdx].position.x;
    this.mFingerSp.position.x = tPosX + 10;
    this.mFingerSp.position.y = tPosY + 20;
    this.mFingerSp.alpha = 1;
    this.mFingerSp.visible = true;
    this.mFingerSp.scale.set(1.2);
    // gsap.killTweensOf(this.mFingerSp);
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.mFingerSp, { x: tPosX, y: tPosY, duration: 0.5 });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      delay: 0.2,
      // repeat: 1,
      // yoyo: true,
      // ease: 'back.out(4)',
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      y: tPosY - 100,
      alpha: 0,
      duration: 0.5,
      // ease: 'back.out(4)',
    });

    // this.mAniTimeLine.to(this.mFingerSp, { x: tPosXAry[1] +10, y: tPosY+10, duration: 0.1 });
    // this.mAniTimeLine.to(this.mFingerSp, { x: tPosXAry[1], y: tPosY, alpha: 1, duration: 0.5 });
    // this.mAniTimeLine.to(this.mFingerSp.scale, { x: 1.2, y: 1.2, duration: 0.1 });
    // this.mAniTimeLine.to(this.mFingerSp.scale, {
    // 	x: 1,
    // 	y: 1,
    // 	duration: 0.2,
    //   repeat: 1,
    //   yoyo: true,
    // 	// ease: 'back.out(4)',
    // });
    // this.mAniTimeLine.to(this.mFingerSp, {
    // 	y: tPosY,
    // 	alpha: 0,
    // 	duration: 0.5,
    // 	// ease: 'back.out(4)',
    // });

    this.startTimeOut(5, true);
  }

  //손가락 감추기를 나타낸다.
  private hideFingerGuide() {
    // clearTimeout(this.mTimeOutHnd);
    this.mTimeOutHnd = null;
    this.mFingerSp.visible = false;
    this.mAffodunce = false;
  }
}
