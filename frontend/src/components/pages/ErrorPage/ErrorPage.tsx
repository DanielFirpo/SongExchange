import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  return (
    <>
    Error: 
      {isRouteErrorResponse(error)
        ? // note that error is type `ErrorResponse`
          error.error?.message || error.statusText
        : "Unknown error message"}
    </>
  );
}

export default ErrorPage;
