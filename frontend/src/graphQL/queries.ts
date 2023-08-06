import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query Users {
    users {
      id
      spotifyRefreshToken
      spotifyUsername
      createdAt
      updatedAt
      playlists {
        id
      }
    }
  }
`;
