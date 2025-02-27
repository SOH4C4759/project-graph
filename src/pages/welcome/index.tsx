import { open } from "@tauri-apps/plugin-shell";
import { ArrowRight, Globe, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../assets/bilibili.svg?react";
import Github from "../../assets/github.svg?react";
import QQ from "../../assets/qq.svg?react";
import ReactIcon from "../../assets/react.svg?react";
import TauriIcon from "../../assets/tauri.svg?react";
import { Camera } from "../../core/stage/Camera";
import { useNavigate } from "../../router";
import { ButtonField, SettingField } from "../settings/_field";

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation("welcome");

  return (
    <>
      {/* 设置语言 */}
      <SettingField icon={<Languages />} settingKey="language" type="select" />
      {/* next按钮 */}
      <ButtonField
        icon={<ArrowRight />}
        title={t("next")}
        label={t("next")}
        onClick={() => {
          navigate("/welcome");
          Camera.reset();
        }}
      />
      {/* 其他链接 */}
      <ButtonField
        icon={<Globe />}
        title={t("website")}
        label="liren.zty012.de/project-graph"
        onClick={() => open("https://project-graph.top")}
      />
      <ButtonField
        icon={<Github />}
        title={t("github")}
        label="LiRenTech/project-graph"
        onClick={() => open("https://github.com/LiRenTech/project-graph")}
      />
      <ButtonField
        icon={<Bilibili />}
        title={t("bilibili")}
        label="@__阿岳__"
        onClick={() => open("https://space.bilibili.com/480804525")}
      />
      <ButtonField
        icon={<QQ />}
        title={t("qq")}
        label="1006956704"
        onClick={() =>
          open(
            "https://qm.qq.com/cgi-bin/qm/qr?k=vYMCABse0VlRjnxxowM6jacl4PEe5IXX&jump_from=webapi&authKey=Vc/JhgAlA+p/KezseanKmN1W5BvCaGMxrRXaDXEIxyR6tvgdyvq2FDfKbI/IDNhw",
          )
        }
      />
      {/* 页脚信息 */}
      <blockquote className="border-l-4 border-gray-500 pl-4 text-gray-500 md:mt-4 lg:mt-8">
        Made by LiRenTech with ❤️
        <br />
        Powered by <TauriIcon className="inline-block h-6 w-6" /> and{" "}
        <ReactIcon className="inline-block h-6 w-6" />
      </blockquote>
    </>
  );
}
