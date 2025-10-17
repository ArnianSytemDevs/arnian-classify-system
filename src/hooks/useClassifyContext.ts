import { useContext } from "react";
import { ClassifyContext } from "../context/ClassifyContext";

export const useClassifyContext = () => {
    const context = useContext(ClassifyContext)
    return context
}