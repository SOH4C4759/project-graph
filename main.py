from PyQt5.QtCore import Qt, QTimer, QUrl
from PyQt5.QtGui import QIcon, QPainter, QPaintEvent, QColor, QWheelEvent, QKeyEvent, QMouseEvent
from PyQt5.QtWidgets import (
    QApplication,
    QDesktopWidget,
    QAction,
    QMainWindow,
    QFileDialog,
    QMessageBox,
    QPushButton,
)

from assets import assets
from camera import Camera
from data_struct.line import Line
from data_struct.number_vector import NumberVector
from entity.entity import Entity
from entity.entity_node import EntityNode
from node_manager import NodeManager
from paint.paint_elements import paint_details_data, paint_grid
from paint.paint_utils import PainterUtils


# 是为了引入assets文件夹中的资源文件，看似是灰色的没有用，但实际不能删掉
# 只是为了让pyinstaller打包时能打包到exe文件中。
# 需要进入assets文件夹后在命令行输入指令 `pyrcc5 image.rcc -o assets.py` 来更新assets.py文件

class Canvas(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()
        # 创建一个定时器用于定期更新窗口
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.tick)
        self.timer.setInterval(16)  # 1000/60 大约= 16ms
        # 启动定时器
        self.timer.start()

        # 重要对象绑定
        self.camera = Camera(NumberVector.zero(), 1920, 1080)
        self.node_manager = NodeManager()
        # 所有拖拽的对象的列表
        self.drag_list: list[EntityNode] = []
        # 当前是否正在拖拽
        self.is_dragging = False
        # 连线相关的操作
        self.connect_from_node: EntityNode | None = None
        self.connect_to_node: EntityNode | None = None
        # 鼠标右键的当前位置
        self.mouse_right_location: NumberVector = NumberVector.zero()
        # 右键开始拖拽的位置
        self.mouse_right_start_location: NumberVector = NumberVector.zero()
        # 当前是否正在切断线
        self.is_cutting = False
        # 准备要被切断的线
        self.warning_lines: list[tuple[Line, EntityNode, EntityNode]] = []
        # 准备要删除的节点
        self.warning_nodes: list[EntityNode] = []

    def init_ui(self):
        # 设置窗口标题和尺寸
        self.setWindowTitle("FastBrainstorming")
        self._move_window_to_center()

    def _move_window_to_center(self):
        # 获取屏幕可用空间（macOS上会有titlebar占据一部分空间）
        screen_geometry = QDesktopWidget().availableGeometry()

        # 计算新的宽度和高度（长宽各取屏幕的百分之八十）
        new_width = screen_geometry.width() * 0.8
        new_height = screen_geometry.height() * 0.8

        # 计算窗口应该移动到的新位置
        new_left = (screen_geometry.width() - new_width) / 2
        new_top = (screen_geometry.height() - new_height) / 2 + screen_geometry.top()

        # 移动窗口到新位置
        self.setGeometry(int(new_left), int(new_top), int(new_width), int(new_height))

    def tick(self):
        self.camera.tick()
        self.update()

    def mousePressEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)
        self.is_dragging = True
        if a0.button() == Qt.MouseButton.LeftButton:
            # 更新被选中的节点
            for node in self.node_manager.nodes:
                node.is_selected = False
            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    node.is_selected = True
                    break
            # 拖拽移动
            self.drag_list.clear()

            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    self.drag_list.append(node)

            for node in self.drag_list:
                if node.is_selected:
                    node.dragging_offset = (
                            point_world_location - node.body_shape.location_left_top
                    )
        elif a0.button() == Qt.MouseButton.RightButton:
            self.mouse_right_location = point_world_location
            self.mouse_right_start_location = point_world_location.clone()
            # 开始连线
            self.is_cutting = True
            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    self.connect_from_node = node
                    print("开始连线")
                    self.is_cutting = False
                    break
            pass

    def mouseMoveEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)

        if self.is_dragging:

            if a0.buttons() == Qt.LeftButton:
                # 如果是左键，移动节点
                for node in self.drag_list:
                    new_left_top = point_world_location - node.dragging_offset
                    d_location = new_left_top - node.body_shape.location_left_top
                    node.move(d_location)
            elif a0.buttons() == Qt.RightButton:
                self.mouse_right_location = point_world_location
                self.warning_lines.clear()
                self.warning_nodes.clear()
                if self.is_cutting:
                    cutting_line = Line(self.mouse_right_start_location, self.mouse_right_location)
                    # 查看切割线是否和其他连线相交
                    for line, start_node, end_node in self.node_manager.get_all_lines_and_node():
                        if line.is_intersecting(cutting_line):
                            # 准备要切断这个线，先进行标注
                            self.warning_lines.append((line, start_node, end_node))
                            pass
                    # 查看切割线是否和其他节点相交
                    for node in self.node_manager.nodes:
                        if node == self.connect_from_node:
                            continue
                        if node.body_shape.is_intersect_with_line(cutting_line):
                            # 准备要切断这个节点，先进行标注
                            self.warning_nodes.append(node)
                else:
                    # 如果是右键，开始连线
                    for node in self.node_manager.nodes:
                        if node.body_shape.is_contain_point(point_world_location):
                            self.connect_to_node = node
                            break

    def mouseReleaseEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)
        self.is_dragging = False

        if a0.button() == Qt.LeftButton:
            pass
        if a0.button() == Qt.RightButton:

            # 结束连线
            if self.connect_from_node is not None and self.connect_to_node is not None:
                connect_result = self.node_manager.connect_node(
                    self.connect_from_node,
                    self.connect_to_node,
                )
                print(f"连接结果: {connect_result}")
            self.connect_from_node = None
            self.connect_to_node = None

            if self.is_cutting:
                # 切断所有准备切断的线
                for line, start_node, end_node in self.warning_lines:
                    self.node_manager.disconnect_node(start_node, end_node)
                self.warning_lines.clear()
                # 删除所有准备删除的节点
                for node in self.warning_nodes:
                    self.node_manager.delete_node(node)
                self.warning_nodes.clear()
                self.is_cutting = False
        pass

    # 双击
    def mouseDoubleClickEvent(self, event):
        # 把点击坐标转换为世界坐标
        click_location = self.camera.location_view2world(
            NumberVector(event.pos().x(), event.pos().y())
        )
        # 如果是左键，添加节点
        if event.button() == Qt.MouseButton.LeftButton:
            self.node_manager.add_node_by_click(click_location)

    def wheelEvent(self, a0: QWheelEvent | None):
        assert a0 is not None
        # 检查滚轮方向
        if a0.angleDelta().y() > 0:
            self.camera.zoom_in()
        else:
            self.camera.zoom_out()

        # 你可以在这里添加更多的逻辑来响应滚轮事件
        a0.accept()

    def keyPressEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        key = a0.key()
        if key == Qt.Key.Key_A:
            self.camera.press_move(NumberVector(-1, 0))
        elif key == Qt.Key.Key_S:
            self.camera.press_move(NumberVector(0, 1))
        elif key == Qt.Key.Key_D:
            self.camera.press_move(NumberVector(1, 0))
        elif key == Qt.Key.Key_W:
            self.camera.press_move(NumberVector(0, -1))

    def keyReleaseEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        key = a0.key()
        if key == Qt.Key.Key_A:
            self.camera.release_move(NumberVector(-1, 0))
        elif key == Qt.Key.Key_S:
            self.camera.release_move(NumberVector(0, 1))
        elif key == Qt.Key.Key_D:
            self.camera.release_move(NumberVector(1, 0))
        elif key == Qt.Key.Key_W:
            self.camera.release_move(NumberVector(0, -1))

    def paintEvent(self, a0: QPaintEvent | None):
        assert a0 is not None
        painter = QPainter(self)
        # 获取窗口的尺寸
        rect = self.rect()
        # 更新camera大小，防止放大窗口后缩放中心点还在左上部分
        self.camera.reset_view_size(rect.width(), rect.height())
        # 使用黑色填充整个窗口
        painter.fillRect(rect, QColor(43, 43, 43, 255))
        # 画网格
        paint_grid(painter, self.camera)
        # 当前的切断线
        if self.is_cutting:
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(self.mouse_right_start_location),
                self.camera.location_world2view(self.mouse_right_location),
                QColor(255, 0, 0),
                2 * self.camera.current_scale,
            )

        # 当前鼠标画连接线
        if self.connect_from_node is not None and self.mouse_right_location is not None:
            # 如果鼠标位置是没有和任何节点相交的
            connect_node = None
            for node in self.node_manager.nodes:
                if node == self.connect_from_node:
                    continue
                if node.body_shape.is_contain_point(self.mouse_right_location):
                    connect_node = node
                    break
            if connect_node:
                # 像吸附住了一样画线
                PainterUtils.paint_arrow(
                    painter,
                    self.camera.location_world2view(self.connect_from_node.body_shape.center),
                    self.camera.location_world2view(connect_node.body_shape.center),
                    QColor(255, 255, 255),
                    2 * self.camera.current_scale,
                    30 * self.camera.current_scale,
                )
            else:
                # 实时连线
                PainterUtils.paint_arrow(
                    painter,
                    self.camera.location_world2view(self.connect_from_node.body_shape.center),
                    self.camera.location_world2view(self.mouse_right_location),
                    QColor(255, 255, 255),
                    2 * self.camera.current_scale,
                    30 * self.camera.current_scale,
                )
        self.node_manager.paint(painter, self.camera)
        # 所有要被切断的线
        for line, _, _ in self.warning_lines:
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(line.start),
                self.camera.location_world2view(line.end),
                QColor(255, 0, 0, 128),
                10 * self.camera.current_scale,
            )
        # 所有要被删除的节点
        for node in self.warning_nodes:
            PainterUtils.paint_rect_from_left_top(
                painter,
                self.camera.location_world2view(node.body_shape.location_left_top),
                node.body_shape.width * self.camera.current_scale,
                node.body_shape.height * self.camera.current_scale,
                QColor(255, 0, 0, 128),
                QColor(255, 0, 0, 128),
                10 * self.camera.current_scale,
            )
        # 绘制细节信息
        paint_details_data(
            painter,
            self.camera,
            [
                f"当前缩放: {self.camera.current_scale:.2f} location: {self.camera.location}"
            ],
        )


def main():
    import sys
    import traceback

    try:
        sys.excepthook = sys.__excepthook__

        app = QApplication(sys.argv)
        app.setWindowIcon(QIcon("./assets/favicon.ico"))

        canvas = Canvas()
        canvas.show()

        sys.exit(app.exec_())
    except Exception as e:
        # 捕捉不到
        traceback.print_exc()
        print(e)
        sys.exit(1)
    pass


if __name__ == "__main__":
    main()
