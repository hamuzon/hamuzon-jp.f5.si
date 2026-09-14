export async function onRequest(context) {
  const url = new URL(context.request.url);
  const originalHostname = url.hostname;

  let shouldRedirect = false;

  if (originalHostname.endsWith(".")) {
    url.hostname = originalHostname.slice(0, -1);
    shouldRedirect = true;
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
        shouldRedirect = true;
      }
    } else {
      url.hostname = "hamuzon-jp.f5.si";
      shouldRedirect = true;
    }
  }

  for (const key of Array.from(url.searchParams.keys())) {
    if (key === "_gl" || key.startsWith("_ga")) {
      url.searchParams.delete(key);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return Response.redirect(url.toString(), 308);
  }

  return context.next();
}
