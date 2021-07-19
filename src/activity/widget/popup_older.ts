import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import * as PIXI from "pixi.js";
import { LgApp } from "../core/app";
import { ResourceManager } from "../core/resourceManager";
import { debugLine } from "../utill/gameUtil";

export class SoundBtn extends PIXI.Sprite {
  private mOnSnd: PIXI.Texture;
  private mOffSnd: PIXI.Texture;
  constructor() {
    super();
    this.mOnSnd = ResourceManager.Handle.getCommon(
      "popup_music_on_btn.png"
    ).texture;
    this.mOffSnd = ResourceManager.Handle.getCommon(
      "popup_music_off_btn.png"
    ).texture;

    this.texture = this.mOnSnd;
    this.anchor.set(0.5);

    this.interactive = true;
    this.buttonMode = true;
    this.on("pointertap", async () => {
      window["clickSnd"].play();
      this.interactive = false;
      this.buttonMode = false;
      await this.toggleSnd();
      this.interactive = true;
      this.buttonMode = true;
    });
  }
  toggleSnd(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.texture == this.mOnSnd) {
        this.texture = this.mOffSnd;
        if (window["bgm"]) window["bgm"].volume = 0;
      } else {
        this.texture = this.mOnSnd;
        if (window["bgm"]) window["bgm"].volume = 1;
      }
      resolve();
    });
  }
}

export class Thumb extends PIXI.Container {
  private mIndex: number;
  get index(): number {
    return this.mIndex;
  }

  set tint(v: number) {
    this.mThumbNail.tint = v;
    this.mThumbLine.tint = v;
  }

  private mThumbLine: PIXI.Sprite;
  private mThumbNail: PIXI.Sprite;
  constructor(index: number) {
    super();
    this.mIndex = index;

    this.mThumbLine = new PIXI.Sprite(
      ResourceManager.Handle.getCommon(`thumbnail_boxline.png`).texture
    );
    this.mThumbLine.anchor.set(0.5);
    this.mThumbLine.visible = false;

    this.mThumbNail = new PIXI.Sprite(
      ResourceManager.Handle.getCommon(`scene${this.mIndex}.png`).texture
    );
    this.mThumbNail.anchor.set(0.5);
    this.addChild(this.mThumbLine, this.mThumbNail);
  }
  showFocus(flag: boolean) {
    flag ? (this.mThumbLine.visible = true) : (this.mThumbLine.visible = false);
  }
}

export class ThumbGroup extends PIXI.Sprite {
  private mThumbAry: Array<Thumb>;
  private mMoveDistance: number;
  constructor() {
    super();
  }
  createThumb() {
    this.mMoveDistance = 0;
    this.mThumbAry = [];
    let offsetX = 150;
    for (let i = 1; i <= 12; i++) {
      const thumb = new Thumb(i);
      thumb.position.set(offsetX, 600);
      offsetX += thumb.width;
      this.addChild(thumb);
      this.mThumbAry.push(thumb);

      thumb.interactive = true;
      thumb.buttonMode = true;
      thumb.on("pointertap", async () => {
        gsap.delayedCall(0.25, async () => {
          if (this.mMoveDistance < 50) {
            await this.thumbInteractive(false);
            await LgApp.Handle.popupGoScene(`page${i}`);
            (this.parent as Popup).hide();
            await this.thumbInteractive(true);
          }
        });
      });
    }
  }

  thumbInteractive(flag: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      for (const thumb of this.mThumbAry) {
        thumb.interactive = flag;
        thumb.buttonMode = flag;
        flag ? (thumb.tint = 0xffffff) : (thumb.tint = 0xbcbcbc);
      }
      resolve();
    });
  }

  // 썸네일 리스트 스와이퍼
  registEvent() {
    this.interactive = true;
    this.buttonMode = true;
    this.hitArea = new PIXI.Rectangle(0, 500, 1280 * 3, 400);
    let flag = false;
    let start = 0;
    let distanceStart = 0;
    this.mMoveDistance = 0;

    this.on("pointerdown", (evt: PIXI.InteractionEvent) => {
      window["clickSnd"].play();
      evt.stopPropagation();
      flag = true;
      distanceStart = evt.data.global.x;
      start = evt.data.global.x;
    })
      .on("pointermove", (evt: PIXI.InteractionEvent) => {
        evt.stopPropagation();
        if (flag) {
          if (this.x > 100) {
            flag = false;
            this.x = 100;
            return;
          } else if (this.x < -2400) {
            flag = false;
            this.x = -2400;
            return;
          }
          const x = evt.data.global.x;
          this.x += x - start;
          start = x;
        }
      })
      .on("pointerup", (evt: PIXI.InteractionEvent) => {
        evt.stopPropagation();
        this.mMoveDistance = Math.abs(distanceStart - evt.data.global.x);
        flag = false;
      })
      .on("pointerout", () => {
        flag = false;
      });
  }

  update() {
    for (const thum of this.mThumbAry) {
      if (thum.index == LgApp.Handle.currentPage) {
        let moveX = 0;

        if (thum.index == 1 || thum.index == 2 || thum.index == 3) {
          moveX = 100;
        } else {
          moveX = -200 * thum.index;
        }

        gsap.to(this, { x: moveX, duration: 0.5, ease: "back" });

        thum.showFocus(true);
      } else {
        thum.showFocus(false);
      }
    }
  }
}

export class Popup extends PIXI.Container {
  private mBG: PIXI.Sprite;
  private mHeader: PIXI.Sprite;
  private mArrow: PIXI.Sprite;
  private mSndBtn: PIXI.Sprite;

  private mPrevBtn: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;
  private mBtnFlag: boolean;

  private mThumbGroup: ThumbGroup;

  constructor() {
    super();
  }

  async onInit() {
    // 팝업 아래부분의 썸네일 나오는 부분의 bg

    await this.createBtn();
    await this.createThumnail();
    await this.createHeader();

    this.addChild(this.mBG, this.mHeader, this.mThumbGroup);
    this.registBtnEvent();
  }

  //  (아래부분 그라데이션 배경 / 이전 / 다음) 버튼 생성
  createBtn(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mBG = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`popup_bg.png`).texture
      );
      this.mBG.interactive = false;
      this.mBG.buttonMode = true;
      this.mBG.hitArea = new PIXI.Rectangle(140, 112, 1000, 360);
      this.mBG.visible = false;

      this.mBG.on("pointerdown", () => {
        this.hide();
      });
      // 이전 버튼
      this.mPrevBtn = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("popup_before_btn.png").texture
      );
      this.mPrevBtn.anchor.set(0.5);
      this.mPrevBtn.position.set(92, 356);

      // 다음 버튼
      this.mNextBtn = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("popup_next_btn.png").texture
      );
      this.mNextBtn.anchor.set(0.5);
      this.mNextBtn.position.set(1190, 356);

      this.mBG.addChild(this.mPrevBtn, this.mNextBtn);

      resolve();
    });
  }
  //썸네일 리스트 생성
  async createThumnail() {
    this.mThumbGroup = new ThumbGroup();
    await this.mThumbGroup.createThumb();
    await this.mThumbGroup.registEvent();

    // this.mBG.addChild(this.mThumbGroup);
    this.mThumbGroup.visible = false;
  }

  // 헤더 부분 생성 (뒤로가기, 음소거 버튼)
  createHeader(): Promise<void> {
    return new Promise<void>((resolve) => {
      //팝업 윗부분 뒤로가기 버튼과 사운드버튼이 포함되어 있는 헤드바 이미지
      this.mHeader = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("popup.png").texture
      );
      this.mHeader.y = -110;
      this.mHeader.interactive = true;

      // 헤더바의 내려오기, 들어가기 버튼
      this.mArrow = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("popup_arrow.png").texture
      );
      this.mArrow.angle = 180;
      this.mArrow.anchor.set(0.5);
      this.mArrow.position.set(1180, 130);
      this.mArrow.interactive = true;
      this.mArrow.buttonMode = true;
      this.mArrow.hitArea = new PIXI.Rectangle(-35, -20, 70, 40);

      // 헤드바의 뒤로가기 버튼
      const backKey = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("popup_back_btn.png").texture
      );
      backKey.anchor.set(0.5);
      backKey.position.set(160, 58);
      backKey.interactive = true;
      backKey.buttonMode = true;
      backKey.on("pointertap", () => {
        window["clickSnd"].play();
        LgApp.Handle.currectSceneName == "mainPage" ? null : location.reload();
      });

      // 음소거 토글버튼
      this.mSndBtn = new SoundBtn();
      this.mSndBtn.position.set(1204, 56);

      this.mHeader.addChild(this.mArrow, backKey, this.mSndBtn);
      resolve();
    });
  }

  thumnailMode(flag: boolean) {
    this.visible = flag;
    flag ? this.prevNextReset() : null;
  }

  registBtnEvent() {
    this.mArrow.on("pointertap", () => {
      window["clickSnd"].play();
      if (this.mArrow.angle == 180) {
        // 팝업이 내려온다 (show)
        this.show();
      } else {
        // 팝업이 올라간다 (hide)
        this.hide();
      }
    });
    this.disableSceneMove(false);

    this.prevNextReset();

    this.mBtnFlag = false;

    this.mPrevBtn.interactive = true;
    this.mPrevBtn.buttonMode = true;
    this.mNextBtn.interactive = true;
    this.mNextBtn.buttonMode = true;

    this.mPrevBtn.on("pointertap", async (evt: PIXI.InteractionEvent) => {
      window["clickSnd"].play();
      evt.stopPropagation();
      if (!this.mBtnFlag) {
        return;
      }

      this.disableSceneMove(false);
      await LgApp.Handle.popupGoScene(`page${LgApp.Handle.currentPage - 1}`);
      this.prevNextReset();
      gsap.delayedCall(1, () => {
        this.disableSceneMove(true);
      });
    });
    this.mNextBtn.on("pointertap", async (evt: PIXI.InteractionEvent) => {
      window["clickSnd"].play();
      evt.stopPropagation();
      if (!this.mBtnFlag) {
        return;
      }
      this.disableSceneMove(false);
      await LgApp.Handle.popupGoScene(`page${LgApp.Handle.currentPage + 1}`);
      this.prevNextReset();
      gsap.delayedCall(1, () => {
        this.disableSceneMove(true);
      });
    });
  }

  async update() {
    await this.mThumbGroup.update();
  }

  // 팝업이 올라간다 (hide)
  hide() {
    if (this.mBG.interactive == false) {
      return;
    }
    gsap.to(this.mArrow, { angle: 180, duration: 0.25 }).delay(0.2);
    gsap.to(this.mHeader, { y: -110, duration: 0.25 }).delay(0.2);
    this.mBG.interactive = false;
    this.mBG.visible = false;
    this.mPrevBtn.visible = false;
    this.mNextBtn.visible = false;
    this.mThumbGroup.visible = false;
    this.disableSceneMove(false);
  }

  // 팝업이 내려온다 (show)
  show() {
    gsap.to(this.mArrow, { angle: 0, duration: 0.25 });
    gsap.to(this.mHeader, { y: 0, duration: 0.25 });
    this.mBG.visible = true;
    this.mBG.interactive = true;
    this.mThumbGroup.visible = true;
    this.mPrevBtn.visible = true;
    this.mNextBtn.visible = true;
    this.disableSceneMove(true);
  }

  disableSceneMove(flag: boolean) {
    if (flag) {
      this.mPrevBtn.tint = 0xffffff;
      this.mNextBtn.tint = 0xffffff;
    } else {
      this.mPrevBtn.tint = 0xbcbcbc;
      this.mNextBtn.tint = 0xbcbcbc;
    }
    this.mThumbGroup.interactive = flag;
    this.mBtnFlag = flag;
    // this.mPrevBtn.interactive = flag;
    // this.mPrevBtn.buttonMode = flag;
    // this.mNextBtn.interactive = flag;
    // this.mNextBtn.buttonMode = flag;
  }

  prevNextReset() {
    const max = 12;

    if (LgApp.Handle.currentPage == 1) {
      this.mPrevBtn.visible = false;
    } else {
      this.mPrevBtn.visible = true;
    }
    if (LgApp.Handle.currentPage >= max) {
      this.mNextBtn.visible = false;
    } else {
      this.mNextBtn.visible = true;
    }
  }
}
