import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Vector } from "../../dataStruct/Vector";
import { Effect } from "../effect";

/**
 * 圆形光圈缩放特效
 */
export class CircleChangeRadiusEffect extends Effect {
  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public location: Vector,
    public radiusStart: number,
    public radiusEnd: number,
    public color: Color,
  ) {
    super(timeProgress);
  }

  get radius() {
    return (
      this.radiusStart +
      (this.radiusEnd - this.radiusStart) * this.timeProgress.rate
    );
  }

  override tick() {
    super.tick();
  }

  static fromConnectPointExpand(location: Vector, expandRadius: number) {
    return new CircleChangeRadiusEffect(
      new ProgressNumber(0, 10),
      location,
      0.01,
      expandRadius,
      new Color(255, 255, 255),
    );
  }
  static fromConnectPointShrink(location: Vector, currentRadius: number) {
    return new CircleChangeRadiusEffect(
      new ProgressNumber(0, 10),
      location, 
      currentRadius,
      0.1,
      new Color(255, 255, 255),
    );
  }
}