import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import pixiSound from "pixi-sound";
require("pixi-spine");
// import "pixi-spine";
import WebFont from "webfontloader";
import { ResourceManager, ResourceTable } from "./resourceManager";
import { SceneBase } from "./sceneBase";
import gsap from "gsap";
import { Common } from "./resource/common";
import config from "../utill/config";
import { Loading } from "./loading";
import { Popup } from "../widget/popup";
import { MainPage } from "../scene/mainPage";
import { ServePage } from "../scene/servePage";
import { Page1 } from "../scene/page1";
import { Page2 } from "../scene/page2";
import { Page3 } from "../scene/page3";
import { Page4 } from "../scene/page4";
import { Page5 } from "../scene/page5";
import { Page6 } from "../scene/page6";
import { Page7 } from "../scene/page7";
import { Page8 } from "../scene/page8";
import { Page9 } from "../scene/page9";
import { Page10 } from "../scene/page10";
import { Page11 } from "../scene/page11";
import { Page12 } from "../scene/page12";
import { page1RscList } from "./resource/viewer/page1RscList";
import { page2RscList } from "./resource/viewer/page2RscList";
import { page3RscList } from "./resource/viewer/page3RscList";
import { page4RscList } from "./resource/viewer/page4RscList";
import { page5RscList } from "./resource/viewer/page5RscList";
import { page6RscList } from "./resource/viewer/page6RscList";
import { page7RscList } from "./resource/viewer/page7RscList";
import { page8RscList } from "./resource/viewer/page8RscList";
import { page9RscList } from "./resource/viewer/page9RscList";
import { page10RscList } from "./resource/viewer/page10RscList";
import { page11RscList } from "./resource/viewer/page11RscList";
import { page12RscList } from "./resource/viewer/page12RscList";
import { EOP } from "../widget/eopScene";

export class LgApp extends PIXI.Application {
  // singleton
  private static _handle: LgApp;
  static get Handle(): LgApp {
    return LgApp._handle;
  }

  get currectSceneName(): string {
    return this.mCurrentSceneName;
  }

  private mLoadingScene: Loading;

  private mSceneStage: PIXI.Container;
  private mModalStage: PIXI.Container;

  private mPopup: Popup;
  private mEop: EOP;
  private mSceneArray: Array<SceneBase>;

  private mCurrentSceneName: string;

  private mCurrentPage: number;
  get currentPage(): number {
    if (this.mCurrentPage < 0) {
      this.mCurrentPage = 1;
    }
    return this.mCurrentPage;
  }

  constructor(canvas: HTMLCanvasElement) {
    super({
      width: 1280,
      height: 800,
      backgroundColor: 0xffffff,
      view: canvas,
    });
    LgApp._handle = this;

    window["spine"] = null;
  }

  async onInit() {
    this.renderer.reset();
    gsap.globalTimeline.clear();
    pixiSound.stopAll();

    this.stage.sortableChildren = true;

    this.mLoadingScene = new Loading();
    this.mLoadingScene.zIndex = 3;
    this.stage.addChild(this.mLoadingScene);
    await this.mLoadingScene.onInit();

    await this._fontLoading();

    if (window["bgm"]) window["bgm"].pause();

    window["bgm"] = document.createElement("audio");
    window[
      "bgm"
    ].src = `https://imestudy.smartdoodle.net/lg/rsc/common/sounds/bgm.mp3`;

    document.onvisibilitychange = async () => {
      /**화면이 보일때 */
      if (document.hidden == false) {
        pixiSound.resumeAll();
        window["spine"] ? (window["spine"].state.timescale = 1) : null;
        const currentPage = LgApp.Handle.currectSceneName.slice(0, 4);
        if (currentPage == "page") {
          window["bgm"].play({ loop: true });
        } else {
          location.reload();
        }
      } else {
        /**화면이 안보일때 */
        pixiSound.pauseAll();
        window["spine"] ? (window["spine"].state.timescale = 0) : null;
        window["bgm"].pause();
      }
    };
    this.mSceneStage = new PIXI.Container();
    this.mModalStage = new PIXI.Container();
    this.stage.addChild(this.mSceneStage, this.mModalStage);

    this.mSceneStage.zIndex = 1;
    this.mModalStage.zIndex = 2;

    await ResourceManager.Handle.loadCommonResource(Common);
    gsap.globalTimeline.clear();
    // loading.onEnd();
    await this.mLoadingScene.onEnd();
    this.stage.removeChild(this.mLoadingScene);

    window["clickSnd"] = ResourceManager.Handle.getCommon("click.mp3").sound;

    await this.createModal();

    this.mSceneArray = [];

    this.addScene(new MainPage());
    this.addScene(new ServePage());
    this.addScene(new Page1());
    this.addScene(new Page2());
    this.addScene(new Page3());
    this.addScene(new Page4());
    this.addScene(new Page5());
    this.addScene(new Page6());
    this.addScene(new Page7());
    this.addScene(new Page8());
    this.addScene(new Page9());
    this.addScene(new Page10());
    this.addScene(new Page11());
    this.addScene(new Page12());

    // this.mCurrentPage = 3;
    // await this.goScene(`page${this.mCurrentPage}`, true);

    this.mCurrentPage = 1;
    this.goScene(`mainPage`, true);

    this.stage.interactive = true;
    this.stage.hitArea = new PIXI.Rectangle(0, 0, config.w, config.h);
    this.stage.on("pointertap", () => {
      const app = document.getElementById("app");
      const w = app.clientWidth;
      const h = app.clientHeight;
      if (w > h) {
        this.goFullScreen();
      }
    });
  }

  private _fontLoading(): Promise<void> {
    return new Promise<void>((resolve) => {
      WebFont.load({
        custom: {
          families: ["TmoneyRoundWindExtraBold", "TmoneyRoundWindRegular"],
          urls: [`https://imestudy.smartdoodle.net/lg/rsc/fonts/fonts.css`],
        },
        timeout: 2000,
        active: () => {
          // console.log(' font loaded')
          resolve();
        },

        fontloading: (fontname) => {
          // // console.log('fontLoading', fontname)
        },
      });
    });
  }

  async createModal() {
    this.mPopup = new Popup();
    await this.mPopup.onInit();

    this.mEop = new EOP();
    this.mModalStage.addChild(this.mPopup, this.mEop);
  }

  async eopFlag(flag: boolean) {
    if (flag) {
      this.mEop.removeChildren();
      await this.mEop.onInit();
      await this.mEop.onStart();
    } else {
      this.mEop.removeChildren();
    }
  }

  addScene(scene: SceneBase) {
    this.mSceneArray.push(scene);
  }

  async goScene(sceneName: string, nonBookMotion?: boolean) {
    this.mPopup.hide();
    if (this.mCurrentSceneName == sceneName && !nonBookMotion) {
      return;
    }

    let sceneFlag = true;
    for (const scene of this.mSceneArray) {
      if (scene.sceneName == sceneName) {
        let page = sceneName.slice(-1);
        if (sceneName.length == 6) {
          page = sceneName.slice(-2);
        }

        pixiSound.stopAll();
        sceneFlag = false;
        this.mSceneStage.x = 0;

        // this.mCurrentPage = +page;
        this.mCurrentSceneName = sceneName;

        // sceneName.slice(0, 4) == "page"
        //   ? this.mPopup.thumnailMode(true)
        //   : this.mPopup.thumnailMode(false);

        this.mModalStage.addChild(this.mLoadingScene);
        await this.mLoadingScene.onInit();
        await this.loadRsc(+page);

        await this.endScene();
        await gsap.globalTimeline.clear();
        gsap.killTweensOf(this.mSceneStage);

        if (this.mLoadingScene) {
          await this.mLoadingScene.onEnd();
          this.mModalStage.removeChild(this.mLoadingScene);
        }

        if (nonBookMotion) {
          this.mSceneStage.removeChildren();
          this.mSceneStage.addChild(scene);
          await scene.onInit();
          await scene.onStart();
        } else {
          const prevPage = this.mCurrentPage;

          if (+page == prevPage) {
            return;
          }
          this.mCurrentPage = +page;
          await scene.onInit();

          scene.x = config.w;
          this.mSceneStage.addChild(scene);
          gsap
            .to(this.mSceneStage, { x: -config.w, duration: 1 })
            .eventCallback("onComplete", async () => {
              this.mSceneStage.x = 0;
              this.mSceneStage.removeChildren();
              this.mSceneStage.addChild(scene);
              scene.position.set(0, 0);
              await scene.onInit();
              await scene.onStart();
            });
        }
        await this.mPopup.update();
        break;
      }
    }

    if (sceneFlag) {
      console.log(`${sceneName}: 없는 액티비티 입니다.`);
    }
  }

  async popupGoScene(sceneName: string) {
    this.mPopup.hide();
    for (const scene of this.mSceneArray) {
      if (scene.sceneName == sceneName) {
        await gsap.globalTimeline.clear();
        gsap.killTweensOf(this.mSceneStage);
        pixiSound.stopAll();

        let page = sceneName.slice(-1);
        if (sceneName.length == 6) {
          page = sceneName.slice(-2);
        }
        const prevPage = this.mCurrentPage;
        if (+page == prevPage) {
          return;
        }
        await this.endScene();

        this.mModalStage.addChild(this.mLoadingScene);
        await this.mLoadingScene.onInit();

        // sceneName.slice(0, 4) == "page"
        //   ? this.mPopup.thumnailMode(true)
        //   : this.mPopup.thumnailMode(false);

        this.mCurrentPage = +page;
        this.mCurrentSceneName = sceneName;
        await this.mPopup.update();

        let prevSceneX = config.w;
        let slideDirection = "prev";
        if (prevPage > +page) {
          //이전으로 이동(왼쪽으로 슬라이드)
          slideDirection = "prev";
        } else {
          // 다음으로 이동(오른쪽으로 슬라이드)
          slideDirection = "next";
        }
        slideDirection == "prev"
          ? (prevSceneX = -config.w)
          : (prevSceneX = config.w);

        await this.loadRsc(+page);

        if (this.mLoadingScene) {
          await this.mLoadingScene.onEnd();
          this.mModalStage.removeChild(this.mLoadingScene);
        }

        await scene.onInit();

        scene.x = prevSceneX;
        this.mSceneStage.addChild(scene);

        gsap
          .to(this.mSceneStage, { x: -prevSceneX, duration: 1 })
          .eventCallback("onComplete", async () => {
            this.mSceneStage.x = 0;
            this.mSceneStage.removeChildren();
            this.mSceneStage.addChild(scene);
            scene.position.set(0, 0);

            await scene.onInit();
            await scene.onStart();
          });

        break;
      }
    }
  }

  endScene(): Promise<void> {
    return new Promise<void>((resolve) => {
      for (const scene of this.mSceneArray) {
        scene.onEnd();
      }
      resolve();
    });
  }

  async loadRsc(pageNum: number) {
    let rsc = page1RscList;
    if (pageNum == 1) rsc = page1RscList;
    if (pageNum == 2) rsc = page2RscList;
    if (pageNum == 3) rsc = page3RscList;
    if (pageNum == 4) rsc = page4RscList;
    if (pageNum == 5) rsc = page5RscList;
    if (pageNum == 6) rsc = page6RscList;
    if (pageNum == 7) rsc = page7RscList;
    if (pageNum == 8) rsc = page8RscList;
    if (pageNum == 9) rsc = page9RscList;
    if (pageNum == 10) rsc = page10RscList;
    if (pageNum == 11) rsc = page11RscList;
    if (pageNum == 12) rsc = page12RscList;
    await ResourceManager.Handle.loadCommonResource(rsc);
  }

  async resetStage() {
    await pixiSound.stopAll();
    await gsap.globalTimeline.clear();
    this.mSceneStage.removeChildren();
    this.mCurrentSceneName = "mainPage";
    this.mCurrentPage = 1;
  }

  goFullScreen() {
    // App.vue에서 overwhite
  }
}
