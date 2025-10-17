import { useState } from "react";
import logo from "../../assets/icon.png";
import { FaBoxes, FaEnvelopeOpenText, FaUsers } from "react-icons/fa";
import { SiAwssecretsmanager } from "react-icons/si";
import { MdTranslate } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useClassifyContext } from "../../hooks/useClassifyContext";

export default function MenuComponent() {
    const { setSelectedWindow } = useClassifyContext();
    const [lengOpen, setLengOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lang: "en" | "es") => {
        i18n.changeLanguage(lang);
        setLengOpen(false);
    };

    // ✅ Base button adaptado a dark mode
    const baseBtn =
        "relative group rounded-xl p-2 cursor-pointer transition text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700";

    // ✅ Tooltip mejorado para dark mode
    const tooltip =
        "absolute left-full ml-2 px-2 py-1 text-sm whitespace-nowrap bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded shadow-md opacity-0 group-hover:opacity-100 transition";

    return (
        <div className="flex flex-col border-r border-gray-300 dark:border-gray-600 items-center h-screen w-[5%] bg-gray-50 dark:bg-slate-800">
            {/* Logo + íconos principales */}
            <div className="flex flex-col py-3 px-2 gap-5 items-center flex-1 w-full">
                <img
                    src={logo}
                    className="cursor-pointer transition hover:scale-105"
                    alt="Logo"
                />

                <button
                    className={baseBtn}
                    aria-label="Entries"
                    onClick={() => {
                        setSelectedWindow(1);
                    }}
                >
                    <FaEnvelopeOpenText className="text-2xl" />
                    <span className={tooltip}>{t("menu.title2")}</span>
                </button>

                <button
                    className={baseBtn}
                    aria-label="Products"
                    onClick={() => {
                        setSelectedWindow(2);
                    }}
                >
                    <FaBoxes className="text-2xl" />
                    <span className={tooltip}>{t("menu.title1")}</span>
                </button>

                <button
                    className={baseBtn}
                    aria-label="Users"
                    onClick={() => {
                        setSelectedWindow(3);
                    }}
                >
                    <FaUsers className="text-2xl" />
                    <span className={tooltip}>{t("menu.title3")}</span>
                </button>

                <button
                    className={baseBtn}
                    aria-label="Logs"
                    onClick={() => {
                        setSelectedWindow(4);
                    }}
                >
                    <SiAwssecretsmanager className="text-2xl" />
                    <span className={tooltip}>{t("menu.title4")}</span>
                </button>
            </div>

            {/* Selector de idioma abajo */}
            <div
                className="relative flex py-3 px-2 items-center"
                onMouseEnter={() => setLengOpen(true)}
                onMouseLeave={() => setLengOpen(false)}
            >
                <button className={baseBtn} aria-label="Language Selector">
                    <MdTranslate className="text-2xl" />
                </button>

                {lengOpen && (
                    <div className="absolute left-full flex bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden animate-fade-in">
                        <button
                            onClick={() => changeLanguage("en")}
                            className="px-5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                        >
                            ENG
                        </button>
                        <button
                            onClick={() => changeLanguage("es")}
                            className="px-5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                        >
                            ES
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
