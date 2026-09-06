export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    return Response.redirect(url.toString(), 308);
  }

  if (url.hostname === "m.hamuzon-jp.f5.si") {
    const userAgent = context.request.headers.get("User-Agent") || "";

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);

    if (!isMobile) {
      url.hostname = "hamuzon-jp.f5.si";
      return Response.redirect(url.toString(), 308);
    }
  }

  return context.next();
}
