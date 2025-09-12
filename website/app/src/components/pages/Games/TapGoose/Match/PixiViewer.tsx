import { Application, useExtend } from "@pixi/react";

import { PixiGoose } from "./PixiGoose";
import { Container } from "pixi.js";
import { useLoadTextures } from "@/src/hooks/PIXI/useLoadTextures";
import goosePng from "./images/goose.png";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { ErrorMessage } from "@/src/components/Goose-UI/ErrorMessage";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import { Link } from "@/src/components/Goose-UI/Link";
import { tapGooseLobbyPath } from "@/src/router/paths";
import { formatTime } from "@/src/utils";

interface PixiViewerProps extends Partial<React.ComponentProps<typeof Application>> {
  handleGooseTap: () => void;
  timeToStartLeft: number | null;
  timeToEndLeft: number | null;
  started: boolean;
  isLoading: boolean;
  errorMsg?: string | null;
  width: number;
  height: number;
}

export const PixiViewer: React.FC<PixiViewerProps> = (props) => {
  useExtend({ Container });
  const {
    handleGooseTap,
    timeToStartLeft,
    timeToEndLeft,
    started,
    isLoading,
    errorMsg,
    backgroundColor = "#101828",
    className = "",
    width,
    height,
    ...rest
  } = props;

  const [isLoadingTextures] = useLoadTextures(goosePng);

  if (isLoadingTextures) {
    return <Loading />;
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex justify-center align-center">
        <Loading />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <ErrorMessage>
        <div>
          <p>{errorMsg}</p>
          <Button color="dark" className="mt-4">
            <Link to={tapGooseLobbyPath}>Go to Lobby</Link>
          </Button>
        </div>
      </ErrorMessage>
    );
  }

  if (!started) {
    return (
      <div className="flex text-center items-center justify-center h-full font-bold text-2xl md:text-4xl xl:text-6xl  ">
        {timeToStartLeft ? `Матч начнется через ${formatTime(timeToStartLeft) || 0}s` : "Ожидание начала матча..."}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Application
        width={width}
        height={height}
        className={`h-full w-full ${className}`}
        backgroundColor={"#101828"}
        {...rest}
      >
        <PixiGoose width={width} height={height} onTap={handleGooseTap} />
      </Application>
      {started && timeToEndLeft !== null && (
        <div
          className="absolute top-4 right-4 px-2 py-1 bg-gray-900 bg-opacity-70 rounded text-gray-300 font-mono text-md select-none pointer-events-none"
          title="Осталось времени до конца матча"
        >
          {formatTime(timeToEndLeft)}
        </div>
      )}
    </div>
  );
};
