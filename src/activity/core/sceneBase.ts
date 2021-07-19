import gsap from "gsap/all";
import * as PIXI from "pixi.js";
import { LgApp } from "./app";
import { ResourceManager, ResourceTable } from "./resourceManager";

export class SceneBase extends PIXI.Container {
  private mSceneName: string;
  get sceneName(): string {
    return this.mSceneName;
  }
  constructor(sceneName: string) {
    super();
    this.mSceneName = sceneName;
  }

  // 각 씬에서 씬에 필요한 리소스나 데이터를 준비한다.
  async onInit() {
    //
  }

  // 게임에 필요한 데이터 및 리소스 준비가 끝나면 게임을 실행시킨다.
  async onStart() {
    //
  }

  async loadResource(rscList: ResourceTable) {
    await ResourceManager.Handle.loadCommonResource(rscList);
  }

  async goScene(sceneName: string, nonBookMotion?: boolean) {
    nonBookMotion
      ? await LgApp.Handle.goScene(sceneName, nonBookMotion)
      : await LgApp.Handle.goScene(sceneName);
  }

  async onEnd() {
    //
  }
}
