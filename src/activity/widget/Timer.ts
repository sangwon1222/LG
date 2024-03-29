export class Timer {
  private remain: number;
  private delay: number;
  private leave: number;
  // private callback: any;
  private start: number;
  private id: any;

  get leaveTime(): number {
    return this.remain;
  }

  constructor(public callback: any, delay: number) {
    this.remain = delay;
    // this.callback = callback;
    this.start = Date.now();
    this.id = setTimeout(callback, delay);
  }

  // 일시정지
  pause = () => {
    clearTimeout(this.id);
    this.remain = Date.now() - this.start;
  };

  // 재개
  resume = () => {
    clearTimeout(this.id);
    this.start = Date.now();
    this.id = setTimeout(this.callback, this.remain);
  };

  clear = () => {
    clearTimeout(this.id);
    this.id = null;
    this.callback = null;
    this.remain = null;
  };
}
