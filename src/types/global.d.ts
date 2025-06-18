
import { DaumPostcodeData } from './database'

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: (state: string) => void;
        onfocus?: () => void;
        onresize?: (size: { width: number; height: number }) => void;
        width?: string | number;
        height?: string | number;
        animation?: boolean;
        hideMapBtn?: boolean;
        hideEngBtn?: boolean;
        autoMapping?: boolean;
        shorthand?: boolean;
        pleaseReadGuide?: number;
        pleaseReadGuideTimer?: number;
        maxSuggestItems?: number;
        showMoreHName?: boolean;
        showMoreRoadName?: boolean;
        showMoreLoadName?: boolean;
        useBannerLink?: boolean;
      }) => {
        open: () => void;
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

export {};