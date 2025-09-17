import { Button } from "./Goose-UI/Forms/Button";

interface RootErrorComponentProps {
  error: Error;
  resetErrorBoundary?: () => void; // для возможности сброса ошибки
}

export const RootErrorComponent: React.FC<RootErrorComponentProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-red-200">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Oops! Что-то пошло не так.</h1>
        <p className="text-red-600 break-words">{error.message}</p>
        {!!resetErrorBoundary && (
          <Button
            className="mt-6"
            onClick={resetErrorBoundary}
            color="danger"
            aria-label="Попробовать снова"
            type="button"
          >
            Попробовать снова
          </Button>
        )}
      </div>
    </div>
  );
};
