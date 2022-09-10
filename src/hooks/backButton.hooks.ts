import { BackButtonHardware } from "./../backButton/backButton";
import { IBackButtonHardware } from "../backButton/backButton";
import { App } from "@capacitor/app";

const hardware: IBackButtonHardware = new BackButtonHardware(App);

export const useBackButton = (): IBackButtonHardware => {
  return hardware;
};
