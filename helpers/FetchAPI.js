const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data?.items || data?.data?.items || data || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return [];
  }
};

module.exports = fetchAPI;
