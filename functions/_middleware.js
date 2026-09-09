export async function onRequest(context) {
  const url = new URL(context.request.url);
  const originalHostname = url.hostname;

  // 末尾のドットを削除
  if (originalHostname.endsWith(".")) {
    url.hostname = originalHostname.slice(0, -1);
    return Response.redirect(url.toString(), 308);
  }

  // アクセス元・広告・Analytics系のパラメータを削除
  const trackingParams = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "utm_source_platform",
    "utm_creative_format",
    "utm_marketing_tactic",
    "gclid",
    "dclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "msclkid",
    "yclid",
    "twclid",
    "ttclid",
    "mc_cid",
    "mc_eid"
  ]);

  let hasTrackingParams = false;

  for (const key of [...url.searchParams.keys()]) {
    if (trackingParams.has(key.toLowerCase())) {
      url.searchParams.delete(key);
      hasTrackingParams = true;
    }
  }

  // トラッキングパラメータがあるアクセスだけリダイレクト
  if (hasTrackingParams) {
    return Response.redirect(url.toString(), 308);
  }

  const userAgent = context.request.headers.get("User-Agent") || "";

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      userAgent
    );

  if (
    originalHostname === "www.m.hamuzon-jp.f5.si" ||
    originalHostname === "m.hamuzon-jp.f5.si"
  ) {
    if (isMobile) {
      if (originalHostname === "www.m.hamuzon-jp.f5.si") {
        url.hostname = "m.hamuzon-jp.f5.si";
        return Response.redirect(url.toString(), 308);
      }
    } else {
      url.hostname = "hamuzon-jp.f5.si";
      return Response.redirect(url.toString(), 308);
    }
  }

  return context.next();
}
