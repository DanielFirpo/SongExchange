import { useQuery, gql } from "@apollo/client"
import { GET_USERS } from "./graphQL/queries"
import { useEffect } from "react";

function App() {

  const {error, loading, data} = useQuery(GET_USERS);

  useEffect(() => {
    console.log(data);
  }, [data])

  return (
    <>

    </>
  )
}

export default App
