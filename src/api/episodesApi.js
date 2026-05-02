const BASE_URL = "/api";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getEpisodes = async () => {
  const response = await fetch("/api/episodes", {
    headers: getHeaders(),
  });

  return await response.json();
};

const getEpisodeById = async (id) => {
  const response = await fetch(`/api/episodes/${id}`, {
    headers: getHeaders(),
  });

  return await response.json();
};

export { getEpisodes, getEpisodeById };