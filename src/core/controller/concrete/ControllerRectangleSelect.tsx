import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Section } from "../../stageObject/entity/Section";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 框选控制器
 */
export const ControllerRectangleSelect = new ControllerClass();

/**
 * 框选按下时在哪个section里按下
 */
let mouseDownSection: Section | null = null;

ControllerRectangleSelect.mousedown = (event: MouseEvent) => {
  if (Controller.pressingKeySet.has("alt")) {
    // layer moving mode
    return;
  }
  const button = event.button;
  if (button !== 0) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

  if (
    StageManager.isEntityOnLocation(pressWorldLocation) ||
    StageManager.isAssociationOnLocation(pressWorldLocation)
  ) {
    // 不是点击在空白处
    return;
  }

  const isHaveEdgeSelected = StageManager.getEdges().some(
    (edge) => edge.isSelected,
  );
  const isHaveEntitySelected = StageManager.getEntities().some(
    (entity) => entity.isSelected,
  );

  // 现在的情况：在空白的地方按下左键

  const sections =
    StageManager.SectionOptions.getSectionsByInnerLocation(pressWorldLocation);
  if (sections.length === 0) {
    // 没有在任何section里按下
    mouseDownSection = null;
  } else {
    mouseDownSection = sections[0];
  }

  if (isHaveEntitySelected || isHaveEdgeSelected) {
    // A
    if (
      Controller.pressingKeySet.has("shift") ||
      Controller.pressingKeySet.has("control")
    ) {
      // 不取消选择
    } else {
      // 取消选择所
      StageManager.getStageObject().forEach((stageObject) => {
        stageObject.isSelected = false;
      });
    }
  }

  // 更新框选框状态
  Stage.isSelecting = true;
  Stage.selectStartLocation = pressWorldLocation.clone();
  Stage.selectEndLocation = pressWorldLocation.clone();
  Stage.selectingRectangle = new Rectangle(
    pressWorldLocation.clone(),
    Vector.getZero(),
  );

  const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
  if (clickedEdge !== null) {
    // 在连线身上按下
    Stage.isSelecting = false;
  }
  ControllerRectangleSelect.lastMoveLocation = pressWorldLocation.clone();
};

ControllerRectangleSelect.mousemove = (event: MouseEvent) => {
  if (!Stage.isSelecting) {
    return;
  }
  if (!Controller.isMouseDown[0]) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  // 正在框选
  Stage.selectEndLocation = worldLocation.clone();

  // 更新框选框
  Stage.selectingRectangle = Rectangle.fromTwoPoints(
    Stage.selectStartLocation,
    Stage.selectEndLocation,
  );
  // 框选框在 section框中的限制情况
  if (mouseDownSection !== null) {
    Stage.selectingRectangle = Rectangle.getIntersectionRectangle(
      Stage.selectingRectangle,
      mouseDownSection.rectangle.expandFromCenter(-10),
    );
  }

  if (
    Controller.pressingKeySet.has("shift") ||
    Controller.pressingKeySet.has("control")
  ) {
    // 移动过程中不先暴力清除
  } else {
    // 先清空所有已经选择了的
    StageManager.getStageObject().forEach((stageObject) => {
      stageObject.isSelected = false;
    });
  }

  if (Controller.pressingKeySet.has("control")) {
    // 交叉选择，没的变有，有的变没
    for (const entity of StageManager.getEntities()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (
        entity.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        if (Controller.lastSelectedEntityUUID.has(entity.uuid)) {
          entity.isSelected = false;
        } else {
          entity.isSelected = true;
        }
      }
    }
    for (const edge of StageManager.getEdges()) {
      if (
        edge.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        if (Controller.lastSelectedEdgeUUID.has(edge.uuid)) {
          edge.isSelected = false;
        } else {
          edge.isSelected = true;
        }
      }
    }
  } else {
    let isHaveEntity = false;
    // 框选逻辑优先级：
    // Entity > Edge

    // Entity
    if (!isHaveEntity) {
      for (const otherEntities of StageManager.getEntities()) {
        // if (otherEntities instanceof Section) {
        //   continue;
        // }
        if (otherEntities.isHiddenBySectionCollapse) {
          continue;
        }

        if (
          otherEntities.collisionBox.isRectangleInCollisionBox(
            Stage.selectingRectangle,
          )
        ) {
          otherEntities.isSelected = true;
          isHaveEntity = true;
        }
      }
    }

    // Edge
    if (!isHaveEntity) {
      // 如果已经有节点被选择了，则不能再选择边了
      for (const edge of StageManager.getEdges()) {
        if (edge.isHiddenBySectionCollapse) {
          continue;
        }
        if (
          edge.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
        ) {
          edge.isSelected = true;
        }
      }
    }
  }
  selectedEntityNormalizing();

  Controller.isMovingEntity = false;
  Controller.isMovingEdge = false;
  ControllerRectangleSelect.lastMoveLocation = worldLocation.clone();
};

/**
 * 规范化选择的实体
 *  法则：永远不能同时框选一个东西和它包含在内部的东西。
 */
function selectedEntityNormalizing() {
  const entities = StageManager.getSelectedEntities();
  const selectedSections = entities.filter(
    (entity) => entity instanceof Section,
  );
  const shallowerSections =
    StageManager.SectionOptions.shallowerSection(selectedSections);
  for (const section of selectedSections) {
    if (!shallowerSections.includes(section)) {
      section.isSelected = false;
    }
  }
  for (const entity of entities) {
    if (entity instanceof Section) {
      continue;
    }
    // 如果这个东西被包含在其他的section里，则取消选择
    for (const section of shallowerSections) {
      if (StageManager.SectionOptions.isEntityInSection(entity, section)) {
        entity.isSelected = false;
      }
    }
  }
}

ControllerRectangleSelect.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  // 左键松开
  Stage.isSelecting = false;
  // 将所有选择到的增加到上次选择的节点中
  Controller.lastSelectedEntityUUID.clear();
  for (const node of StageManager.getEntities()) {
    if (node.isSelected) {
      Controller.lastSelectedEntityUUID.add(node.uuid);
    }
  }

  Controller.lastSelectedEdgeUUID.clear();
  for (const edge of StageManager.getEdges()) {
    if (edge.isSelected) {
      Controller.lastSelectedEdgeUUID.add(edge.uuid);
    }
  }
};
