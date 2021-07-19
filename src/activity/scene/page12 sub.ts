import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import { InteractionEvent, resources } from "pixi.js";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";

export class ExBox extends PIXI.Sprite {
  private mShowFlag: boolean;
  private mAniTimeLine: any;
  private mLockFlag: boolean;
  private mClearFlag: boolean;

  private mCardText: string;
  get cardText(): string {
    return this.mCardText;
  }
  get idx(): number {
    return this.mIdx;
  }

  get clearFlag(): boolean {
    return this.mClearFlag;
  }
  set clearFlag(v: boolean) {
    this.mClearFlag = v;
  }

  get lockFlag(): boolean {
    return this.mLockFlag;
  }
  set lockFlag(v: boolean) {
    this.mLockFlag = v;
  }

  get matchIdx(): { aryIdx: number; matchIdx: number } {
    return this.mMatchIdx;
  }
  set matchIdx(v: { aryIdx: number; matchIdx: number }) {
    this.mMatchIdx = v;
  }
  // 1=> 방귀
  // 2=> 분홍색 솜사탕
  // 3=> 빵
  // 4=> 눈
  // 5=> 아이스크림
  // 6=> 분홍색 안개
  constructor(
    private mIdx: number,
    private mMatchIdx: { aryIdx: number; matchIdx: number }
  ) {
    super();

    const list = [
      "방귀",
      "분홍색 솜사탕",
      "빵",
      "눈",
      "아이스크림",
      "분홍색 안개",
    ];
    this.mCardText = list[this.mIdx - 1];

    this.mShowFlag = false;
    this.mClearFlag = false;
    this.texture = ResourceManager.Handle.getCommon(
      `matching_card1.png`
    ).texture;
    this.anchor.set(0.5);

    this.on("pointertap", (evt: InteractionEvent) => {
      if (this.mLockFlag) return;
      if (this.mClearFlag) return;

      this.mShowFlag = !this.mShowFlag;
      this.mShowFlag ? this.openCard() : this.closeCard();
      const effect = ResourceManager.Handle.getCommon("03_activitysfx_1.mp3")
        .sound;
      effect.play();
      gsap.delayedCall(0.5, () => {
        effect.stop();
      });

      this.onPointertap(evt);
    });
  }

  startCardGame() {
    this.interactive = true;
    this.buttonMode = true;
  }

  openCard() {
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.scale, { x: 0, duration: 0.2 });
    gsap.delayedCall(0.2, () => {
      this.texture = ResourceManager.Handle.getCommon(
        `activity3_ex_${this.mIdx}.png`
      ).texture;
    });
    this.mAniTimeLine.to(this.scale, { x: 1, duration: 0.3 });
  }

  closeCard() {
    this.mShowFlag = false;
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.scale, { x: 0, duration: 0.2 });
    gsap.delayedCall(0.2, () => {
      this.texture = ResourceManager.Handle.getCommon(
        `matching_card1.png`
      ).texture;
    });
    this.mAniTimeLine.to(this.scale, { x: 1, duration: 0.3 });
  }

  onPointertap(evt: PIXI.InteractionEvent) {
    //
  }
}
export class Page12 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mSpeaker: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;
  private mExBoxAry: Array<ExBox>;
  private mOpenMatch: { aryIdx: number; matchIdx: number };
  private mMatchingAry: any;

  constructor() {
    super("page12");
  }
  async onInit() {
    this.removeChildren();
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        location.reload();
      }
    };
    this.mExBoxAry = [];
    this.mOpenMatch = null;

    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("matching_bg.png").texture
    );
    this.addChild(this.mBG);

    const tMatchAry = [1, 2, 1, 3, 3, 2];

    for (let i = 0; i < 6; i++) {
      const tExBox = new ExBox(i + 1, { aryIdx: i, matchIdx: tMatchAry[i] });
      let tPosY = 600;
      if (i < 3) tPosY = 300;

      tExBox.position.set(340 * (i % 3) + 300, tPosY);
      this.addChild(tExBox);
      this.mExBoxAry[i] = tExBox;
    }
  }
  async onStart() {
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("matching_bg.png").texture
    );
    this.addChild(this.mBG);
    const tMatchAry = [1, 2, 1, 3, 3, 2];

    for (let i = 0; i < 6; i++) {
      const tExBox = new ExBox(i + 1, { aryIdx: i, matchIdx: tMatchAry[i] });
      let tPosY = 600;
      if (i < 3) tPosY = 300;

      tExBox.position.set(340 * (i % 3) + 300, tPosY);
      this.addChild(tExBox);
      tExBox.openCard();

      tExBox.onPointertap = () => {
        window["clickSnd"].play();
        if (this.mOpenMatch === null) {
          this.mOpenMatch = { aryIdx: i, matchIdx: tMatchAry[i] };
        } else {
          this.lockExBox(true);
          gsap.delayedCall(1, () => {
            if (
              this.mOpenMatch.aryIdx != i &&
              this.mOpenMatch.matchIdx === tMatchAry[i]
            ) {
              ResourceManager.Handle.getCommon("correct.mp3").sound.play();
              tExBox.clearFlag = true;
              this.mExBoxAry[this.mOpenMatch.aryIdx].clearFlag = true;
            } else {
              ResourceManager.Handle.getCommon("wrong.mp3").sound.play();
              tExBox.closeCard();
              this.mExBoxAry[this.mOpenMatch.aryIdx].closeCard();
            }
            this.mOpenMatch = null;
            this.lockExBox(false);

            if (this.isComplete()) {
              this.completeMotion();
            }
          });
        }
      };
      this.mExBoxAry[i] = tExBox;
    }
    this.mMatchingAry = [
      { aryIdx: 0, matchIdx: tMatchAry[0] },
      { aryIdx: 1, matchIdx: tMatchAry[1] },
      { aryIdx: 2, matchIdx: tMatchAry[2] },
      { aryIdx: 3, matchIdx: tMatchAry[3] },
      { aryIdx: 4, matchIdx: tMatchAry[4] },
      { aryIdx: 5, matchIdx: tMatchAry[5] },
    ];

    const directionSnd = ResourceManager.Handle.getCommon("03_activity_1.mp3")
      .sound;
    directionSnd.play();
    gsap.delayedCall(directionSnd.duration, () => {
      for (let i = 0; i < 6; i++) {
        this.mExBoxAry[i].closeCard();
        this.mExBoxAry[i].startCardGame();
      }
    });
  }

  private isComplete(): boolean {
    let flag = true;
    for (const card of this.mExBoxAry) {
      if (card.clearFlag == false) {
        flag = false;
      }
    }
    return flag;
  }

  private completeMotion() {
    const dimmed = new PIXI.Graphics();
    dimmed.beginFill(0x000000, 1);
    dimmed.drawRect(0, 0, config.w, config.h);
    dimmed.endFill();
    this.addChild(dimmed);
    dimmed.alpha = 0;
    gsap
      .to(dimmed, { alpha: 0.8, duration: 0.5 })
      .eventCallback("onComplete", async () => {
        await this.outro();
        this.removeChild(dimmed);
        dimmed.alpha = 0;
        this.addChild(dimmed);
        gsap
          .to(dimmed, { alpha: 0.8, duration: 0.5 })
          .eventCallback("onComplete", async () => {
            await this.eop();
          });
      });
  }

  private outro(): Promise<void> {
    return new Promise<void>((resolve) => {
      const random = Math.ceil(Math.random() * 3);
      const cardAry = [];
      for (let i = 0; i < this.mExBoxAry.length; i++) {
        if (this.mExBoxAry[i].matchIdx.matchIdx == random) {
          cardAry.push(this.mExBoxAry[i]);
          gsap.to(this.mExBoxAry[i].scale, { x: 0, y: 0, duration: 0.5 });
        }
      }

      for (let i = 0; i < cardAry.length; i++) {
        const text = new PIXI.Text(cardAry[i].cardText, {
          fill: 0xffffff,
          fontSize: 48,
          fontFamily: "TmoneyRoundWindExtraBold",
        });
        text.alpha = 0;
        text.pivot.set(text.width / 2, text.height / 2);
        text.position.set(config.w / 2, config.h / 2 + 200);

        cardAry[i].anchor.set(0.5);
        cardAry[i].position.set(config.w / 2, config.h / 2);

        this.addChild(cardAry[i], text);

        const gap = 200;
        gsap.to(cardAry[i].scale, { x: 1, y: 1, duration: 0.5 });
        if (i == 0) {
          gsap
            .to(cardAry[i], { x: cardAry[i].x - gap, duration: 1 })
            .delay(0.5);
          gsap.to(text, { x: cardAry[i].x - gap, duration: 1 }).delay(0.5);
          gsap.to(text, { alpha: 1, duration: 1 }).delay(0.5);
        } else {
          gsap
            .to(cardAry[i], { x: cardAry[i].x + gap, duration: 1 })
            .delay(0.5);
          gsap.to(text, { x: cardAry[i].x + gap, duration: 1 }).delay(0.5);
          gsap.to(text, { alpha: 1, duration: 1 }).delay(0.5);
        }
      }

      gsap.delayedCall(2, () => {
        ResourceManager.Handle.getCommon(
          `03_activity_${cardAry[0].idx + 1}.mp3`
        ).sound.play();
      });
      gsap.delayedCall(4, () => {
        ResourceManager.Handle.getCommon(
          `03_activity_${cardAry[1].idx + 1}.mp3`
        ).sound.play();
      });
      gsap
        .to(cardAry[0].scale, { x: 1.2, y: 1.2, duration: 0.5 })
        .delay(2)
        .repeat(1)
        .yoyo(true);
      gsap
        .to(cardAry[1].scale, { x: 1.2, y: 1.2, duration: 0.5 })
        .delay(4)
        .repeat(1)
        .yoyo(true)
        .eventCallback("onComplete", () => {
          gsap.delayedCall(2, () => {
            resolve();
          });
        });
    });
  }

  private eop(): Promise<void> {
    return new Promise<void>((resolve) => {
      const effect = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("effect.png").texture
      );
      effect.anchor.set(0.5);
      effect.position.set(config.w / 2, config.h * 1.5);
      effect.alpha = 0;

      const cha = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("cha.png").texture
      );
      cha.anchor.set(0.5);
      cha.position.set(config.w / 2, config.h / 2 - 100);
      cha.scale.set(0);

      const done = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("btn_done.png").texture
      );
      done.anchor.set(0.5);
      done.position.set(config.w / 2 - 200, config.h / 2 + 240);
      done.alpha = 0;

      done.on("pointertap", async () => {
        await this.goScene("page1");
        resolve();
      });

      const home = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("btn_home.png").texture
      );
      home.anchor.set(0.5);
      home.position.set(config.w / 2 + 200, config.h / 2 + 240);
      home.alpha = 0;

      home.on("pointertap", () => {
        location.reload();
        resolve();
      });

      this.addChild(effect, cha, done, home);

      gsap.to(effect, {
        y: effect.height / 2,
        alpha: 1,
        duration: 0.5,
        ease: "back",
      });
      gsap
        .to(cha.scale, { x: 1, y: 1, duration: 0.5, ease: "back" })
        .delay(0.5)
        .eventCallback("onComplete", () => {
          gsap.to(home, { alpha: 1, duration: 0.5 });
          gsap.to(done, { alpha: 1, duration: 0.5 });
          done.interactive = true;
          done.buttonMode = true;
          home.interactive = true;
          home.buttonMode = true;
        });
    });
  }

  private lockExBox(tVal: boolean) {
    for (let i = 0; i < 6; i++) {
      this.mExBoxAry[i].lockFlag = tVal;
    }
  }

  //완료후 다음 페이지로 이동 버튼 활성화를 나타낸다.
  async onClearMove() {
    this.mNextBtn = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("popup_next_btn.png").texture
    );
    this.mNextBtn.anchor.set(0.5);
    this.mNextBtn.position.set(1189, 402);
    this.addChild(this.mNextBtn);

    this.mNextBtn.interactive = true;
    this.mNextBtn.buttonMode = true;
    this.mNextBtn.on("pointertap", (evt: InteractionEvent) => {
      this.goScene("page10");
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
}
