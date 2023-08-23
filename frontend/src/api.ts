import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface SpotifyPlaylist {
    name: string,
    image: string,
    preview: string,
    id: string,
    count: number
}

export type PlaylistItem = {
  id: string;
  name: string;
};

interface Recommendations {
  users: RecommendationUser[];
}

interface RecommendationUser {
  name: string;
  commonality: number;
  totalSongsInCommon: number;
  totalSongsNotInCommon: number;
  playlists: RecommendationPlaylist[];
}

interface RecommendationPlaylist {
  name: string;
  songsInCommon: {
    name: string;
    spotifyId: string;
    artist: string;
  }[];
  newSongs: {
    name: string;
    spotifyId: string;
    artist: string;
  }[];
}

interface ExportPlaylist {
  songs: string[];
  playlistName: string;
  playlistDescription: string;
}

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL + "/", credentials: "include"}),
  endpoints: (builder) => ({
    getUserPlaylists: builder.query<SpotifyPlaylist[], void>({
      query: () => `spotifyplaylists`,
      transformResponse: (response: any[]) =>
        response.map((item) => ({
          name: item.name,
          image: item.images?.[0]?.url ? item.images[0].url : undefined,
          preview: item.audioPreview,
          id: item.id,
          count: item.tracks.total,
        })),
    }),
    setPlaylists: builder.mutation<void, PlaylistItem[]>({
      query: (items) => ({
        url: 'playlists',
        method: 'POST',
        body: items,
      }),
    }),
    getRecommendations: builder.query<Recommendations, void>({
      query: () => `recommendations`,
    }),
    exportPlaylist: builder.mutation<any, ExportPlaylist>({
      query: (playlist) => ({
        url: 'export',
        method: 'POST',
        body: playlist,
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserPlaylistsQuery, useSetPlaylistsMutation, useGetRecommendationsQuery, useExportPlaylistMutation } = api