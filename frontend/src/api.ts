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
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserPlaylistsQuery, useSetPlaylistsMutation } = api