const api =
  "EAAOpn4CU8GEBPYY24EaSPyxoSLAAE2OaZCHZADBwSyZAbHoQMdytJtGsGxZBCgRNnhZAu64T60xtTTVIEHaHRlGubJoHTfB3H3OZC06JbWqpOfdzNVrxUEI8H0FlVZAENOPweIerMGal5VciaWvtUV3jRdcezVpCPKp84NZCnlQpLiqQyYBeFNnsjSg3mfMdZBaYwwXPYUUMHjRZC8pmZCef3EpVfGm2rIP7Md164WdsyRZBxzXcjjq4M81a709HBTNdCyIZD";

const VIDEO_ID = "1986456555490395";

async function getVideo() {
  const url = `https://graph.facebook.com/v21.0/${VIDEO_ID}?fields=source,permalink_url,description,length,created_time&access_token=${api}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}

getVideo();
