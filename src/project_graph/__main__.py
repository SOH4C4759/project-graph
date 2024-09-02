import platform
import shutil
import sys
import traceback
from pathlib import Path
from types import TracebackType

import PyQt5
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication

from project_graph.logging import log, logs

# 导入资源文件
try:
    import project_graph.assets.assets  # type: ignore  # noqa: F401
except ImportError:
    from PyQt5 import pyrcc_main

    if not pyrcc_main.processResourceFile(
        [(Path(__file__).parent / "assets" / "image.rcc").as_posix()],
        (Path(__file__).parent / "assets" / "assets.py").as_posix(),
        False,
    ):
        log("Failed to compile assets.rcc")
        exit(1)

    import project_graph.assets.assets  # type: ignore  # noqa: F401

# 修复fcitx5输入法
if platform.system() == "Linux":
    target_path = (
        Path(PyQt5.__file__).parent
        / "Qt5"
        / "plugins"
        / "platforminputcontexts"
        / "libfcitx5platforminputcontextplugin.so"
    )
    source_path = (
        Path(__file__).parent.parent.parent
        / "lib"
        / "libfcitx5platforminputcontextplugin.so"
    )
    if not target_path.exists():
        log(f"修复fcitx5输入法: Copy {source_path} to {target_path}")
        shutil.copy(source_path, target_path)


def my_except_hook(
    exctype: type[BaseException], value: BaseException, tb: TracebackType
) -> None:
    if exctype is KeyboardInterrupt:
        sys.exit(0)

    print("error!!!")
    log("\n".join(traceback.format_exception(exctype, value, tb)))
    print(logs)
    # 用tkinter弹出错误信息，用输入框组件显示错误信息
    import tkinter as tk

    root = tk.Tk()
    root.title("error!")
    tk.Label(root, text="出现异常！").pack()
    t = tk.Text(root, height=10, width=50)
    for line in logs:
        t.insert(tk.END, line + "\n")
    t.pack()
    tk.Button(root, text="确定", command=root.destroy).pack()
    tk.Button(root, text="退出", command=sys.exit).pack()
    root.mainloop()


def main():
    sys.excepthook = my_except_hook

    app = QApplication(sys.argv)
    app.setWindowIcon(QIcon("./assets/favicon.ico"))

    # 只在这里导入主窗口，防止最开始导入，一些东西没初始化好
    from project_graph.ui.main_window.main_window import Canvas

    canvas = Canvas()
    canvas.show()

    sys.exit(app.exec_())


if __name__ == "__main__":
    main()