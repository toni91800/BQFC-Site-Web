const INSTAGRAM_MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

function jsonResponse(status, payload, cacheControl = 'no-store'){
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

function isHttpsUrl(value){
  if(typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function handler(request){
  if(request.method !== 'GET'){
    return jsonResponse(405, {error: 'Méthode non autorisée.'});
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if(!accessToken){
    console.error('Instagram feed is not configured: INSTAGRAM_ACCESS_TOKEN is missing.');
    return jsonResponse(503, {error: 'Le flux Instagram n’est pas configuré.'});
  }

  try {
    const instagramUrl = new URL('https://graph.instagram.com/me/media');
    instagramUrl.searchParams.set('fields', INSTAGRAM_MEDIA_FIELDS);
    instagramUrl.searchParams.set('limit', '12');
    instagramUrl.searchParams.set('access_token', accessToken);

    const response = await fetch(instagramUrl, {
      headers: {Accept: 'application/json'},
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if(!response.ok || result.error){
      const apiMessage = result.error?.message || `Instagram returned status ${response.status}.`;
      throw new Error(apiMessage);
    }
    if(!Array.isArray(result.data)){
      throw new Error('Instagram returned an invalid media list.');
    }

    const posts = result.data
      .filter(post =>
        post && typeof post.permalink === 'string' && isHttpsUrl(post.permalink) &&
        typeof post.timestamp === 'string' &&
        isHttpsUrl(post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url)
      )
      .map(post => ({
        id: String(post.id),
        caption: typeof post.caption === 'string' ? post.caption : '',
        mediaType: typeof post.media_type === 'string' ? post.media_type : 'IMAGE',
        mediaUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
      }));

    return jsonResponse(200, {posts}, 'public, max-age=300, s-maxage=300');
  } catch(error) {
    console.error('Unable to load Instagram posts:', error);
    return jsonResponse(502, {error: 'Impossible de récupérer les publications Instagram.'});
  }
}
