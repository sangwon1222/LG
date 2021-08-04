import { LgApp } from "@/activity/core/app";
import config from "../utill/config";

export interface ResourceTable {
  images?: Array<string>;
  sounds?: Array<string>;
  spine?: Array<string>;
  video?: Array<string>;
}

export class ResourceManager {
  // singletone
  private static _handle: ResourceManager;
  static get Handle(): ResourceManager {
    ResourceManager._handle
      ? ResourceManager._handle
      : (ResourceManager._handle = new ResourceManager());

    return ResourceManager._handle;
  }

  private mUrl: string;
  //공통 리소스
  private mCommon: {};
  // 몇 권의 액티비티와 상관없이 게임에 공통으로 들어가는 리소스
  private mViewer: {};
  // 권마다 바뀌는 리소스
  private mProduct: {};

  constructor() {
    this.mUrl = config.resource;
    // this.mUrl = "../lg_rsc/";
    this.mCommon = {};
    this.mViewer = {};
    this.mProduct = {};
  }

  getCommon(fname: string): PIXI.LoaderResource {
    return this.mCommon[`${fname}`];
  }
  getViewer(fname: string): PIXI.LoaderResource {
    return this.mViewer[`${fname}`];
  }
  getProduct(fname: string): PIXI.LoaderResource {
    return this.mProduct[`${fname}`];
  }

  private resetLoader(): Promise<void> {
    return new Promise<void>((resolve) => {
      PIXI.utils.clearTextureCache();
      PIXI.Loader.shared.destroy();
      PIXI.Loader.shared.reset();
      resolve();
    });
  }

  public async loadCommonResource(rscList: ResourceTable) {
    await this.resetLoader();

    for (const [category, fnamelist] of Object.entries(rscList)) {
      for (const fname of fnamelist) {
        if (this.mCommon[`${fname}`] === undefined) {
          PIXI.Loader.shared.add(
            `${fname}`,
            `${this.mUrl}common/${category.toLowerCase()}/${fname}`
          );
        }
      }
    }

    await this.commonLoad();
  }

  private commonLoad(): Promise<void> {
    return new Promise<void>((resolve) => {
      PIXI.Loader.shared.load((loader, resource) => {
        for (const [key, value] of Object.entries(resource)) {
          if (!this.mCommon[key]) this.mCommon[key] = value;
        }
        resolve();
      });
    });
  }

  // private viewerLoad(): Promise<void> {
  //   return new Promise<void>((resolve) => {
  //     PIXI.Loader.shared.load((loader, resource) => {
  //       for (const [key, value] of Object.entries(resource)) {
  //         this.mViewer[key] = value;
  //       }
  //       resolve();
  //     });
  //   });
  // }

  // public async loadViewerResource(rscList: ResourceTable) {
  //   await this.resetLoader();
  //   const sceneName = LgApp.Handle.currectSceneName;
  //   for (const [category, fnamelist] of Object.entries(rscList)) {
  //     for (const fname of fnamelist) {
  //       if (this.mViewer[`${fname}`] === undefined) {
  //         PIXI.Loader.shared.add(
  //           `${fname}`,
  //           `${this.mUrl}viewer/${sceneName}/${category.toLowerCase()}/${fname}`
  //         );
  //       }
  //     }
  //   }

  //   await this.viewerLoad();
  // }
}
