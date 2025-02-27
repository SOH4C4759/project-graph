import { Vector } from "../dataStruct/Vector";
import { StageManager } from "../stage/stageManager/StageManager";
import { CollisionBox } from "./collisionBox/collisionBox";

/**
 * 注：关于舞台上的东西的这一部分的
 * 继承体系是 Rutubet 和 Littlefean 的讨论结果
 *
 */

/**
 * 一切舞台上的东西
 * 都具有碰撞箱，uuid
 */
export abstract class StageObject implements Disposable {
  [Symbol.dispose](): void {
    throw new Error("Method not implemented.");
  }

  public abstract uuid: string;

  public abstract collisionBox: CollisionBox;

  _isSelected: boolean = false;

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    this._isSelected = value;
  }
}

/**
 * 一切独立存在、能被移动的东西，且放在框里能被连带移动的东西
 * 实体
 */
export abstract class Entity extends StageObject {
  abstract move(delta: Vector): void;
  abstract moveTo(location: Vector): void;

  public details: string = "";
  public isEditingDetails: boolean = false;
  /** 用于交互使用，比如鼠标悬浮显示details */
  public isMouseHover: boolean = false;

  changeDetails(details: string) {
    this.details = details;
  }
  /**
   * 由于自身位置的移动，递归的更新所有父级Section的位置和大小
   */
  protected updateFatherSectionByMove() {
    const fatherSections = StageManager.SectionOptions.getFatherSections(this);
    for (const section of fatherSections) {
      section.adjustLocationAndSize();
      section.updateFatherSectionByMove();
    }
  }
  /**
   * 由于自身位置的更新，排开所有同级节点的位置
   * 此函数在move函数中被调用，更新
   */
  protected updateOtherEntityLocationByMove() {
    for (const entity of StageManager.getEntities()) {
      if (entity === this) {
        continue;
      }
      this.collideWithOtherEntity(entity);
    }
  }

  /**
   * 与其他实体碰撞，调整位置；能够递归传递
   * @param other 其他实体
   */
  protected collideWithOtherEntity(other: Entity) {
    const selfRectangle = this.collisionBox.getRectangle();
    const otherRectangle = other.collisionBox.getRectangle();
    if (!selfRectangle.isCollideWith(otherRectangle)) {
      return;
    }

    // 两者相交，需要调整位置
    const overlapSize = selfRectangle.getOverlapSize(otherRectangle);
    let moveDelta;
    if (Math.abs(overlapSize.x) < Math.abs(overlapSize.y)) {
      moveDelta = new Vector(
        overlapSize.x *
          Math.sign(otherRectangle.center.x - selfRectangle.center.x),
        0,
      );
    } else {
      moveDelta = new Vector(
        0,
        overlapSize.y *
          Math.sign(otherRectangle.center.y - selfRectangle.center.y),
      );
    }
    other.move(moveDelta);
  }
  /**
   * 是不是因为所在的Section被折叠而隐藏了
   * 因为任何Entity都可以放入Section
   */
  abstract isHiddenBySectionCollapse: boolean;
}

/**
 * 一切可被Edge连接的东西，且会算入图分析算法的东西
 */
export abstract class ConnectableEntity extends Entity {
  /**
   * 几何中心点
   * 用于联动旋转等算法
   */
  abstract geometryCenter: Vector;

  /**
   * 当该实体被连线识别时，会改成false
   */
  public unknown = true;
}

/**
 * 一切连接关系的抽象
 */
export abstract class Association extends StageObject {
  public associationList: StageObject[] = [];
}

/**
 * 一切可被连接的关联
 */
export abstract class ConnectableAssociation extends Association {
  public override associationList: ConnectableEntity[] = [];

  public reverse() {
    const temp = this.associationList[0];
    this.associationList[0] = this.associationList[1];
    this.associationList[1] = temp;
  }

  get target(): ConnectableEntity {
    return this.associationList[0];
  }

  set target(value: ConnectableEntity) {
    this.associationList[0] = value;
  }

  get source(): ConnectableEntity {
    return this.associationList[1];
  }
  set source(value: ConnectableEntity) {
    this.associationList[1] = value;
  }
}
