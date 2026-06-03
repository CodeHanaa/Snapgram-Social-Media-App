import { createContext } from "react";

import { type IContextType } from "@/Types";

import { INITIAL_STATE } from "@/Context";

export const AuthContext =
    createContext<IContextType>(INITIAL_STATE);