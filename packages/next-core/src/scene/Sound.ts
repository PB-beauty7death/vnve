import { SourceStore } from "../assets";
import { fetchAudioBuffer, reviveList, uuid } from "../util";

export interface ISoundOption {
  source: string;
}

export class Sound {
  public name: string;
  public label: string;
  public source: string;

  public buffer?: AudioBuffer;

  constructor(options: ISoundOption) {
    this.name = uuid();
    this.label = "";
    this.source = options.source;
  }

  public async load() {
    this.buffer = await fetchAudioBuffer(this.source);
  }

  public clone(exact = false) {
    const cloned = new Sound({ source: this.source });

    copyTo(this, cloned, exact);

    return cloned;
  }

  public toJSON() {
    const json = {};

    copyTo(this, json as Sound, true);

    return {
      __type: "Sound",
      ...json,
      source: SourceStore.get(this.source),
    };
  }

  static async fromJSON(json: AnyJSON) {
    const source = await SourceStore.set(json.source);
    const sound = new Sound({ source });

    copyTo(json as Sound, sound, true);

    return sound;
  }

  public destroy() {
    if (this.source?.startsWith("blob:")) {
      URL.revokeObjectURL(this.source);
    }

    this.buffer = undefined;
  }
}

function copyTo(from: Sound, to: Sound, exact = false) {
  if (exact) {
    to.name = from.name;
  }
  to.label = from.label;
}

export function reviveSounds(soundsJSON: AnyJSON): Promise<Sound[]> {
  return reviveList({ Sound }, soundsJSON);
}