export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Accept ヘッダーまたはクエリパラメータによる JSON 判定
  const acceptHeader = request.headers.get("accept") || "";
  const isJson = acceptHeader.includes("application/json") || url.searchParams.get("format") === "json";

  const headers = {
    "Status": "418 I'm a teapot",
    "X-Powered-By": "Tea-Leaves",
    "X-Tea-Temperature": "95C",
    "X-Brew-Type": "Earl Grey",
    "Cache-Control": "no-cache"
  };

  if (isJson) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    const jsonBody = JSON.stringify({
      status: 418,
      error: "I'm a teapot",
      message: "The requested entity body is short and stout. Cannot brew coffee with a teapot.",
      rfc: "https://www.rfc-editor.org/rfc/rfc2324",
      supported_drinks: ["green_tea", "earl_grey", "roasted_green_tea", "jasmine_tea"],
      unsupported_drinks: ["coffee", "espresso", "latte", "cappuccino"]
    }, null, 2);

    return new Response(jsonBody, {
      status: 418,
      statusText: "I'm a teapot",
      headers
    });
  }

  headers["Content-Type"] = "text/html; charset=utf-8";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>418 I'm a teapot | hamuzon</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <meta name="description" content="418 I'm a teapot (RFC 2324) - このサーバーはティーポットです。コーヒーを淹れることはできません。">
  <meta property="og:title" content="418 I'm a teapot">
  <meta property="og:description" content="このサーバーはティーポットです。コーヒーを淹れることはできません。">
  <meta property="og:type" content="website">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Kaku Gothic ProN', sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #1b162b 0%, #2e1c3b 50%, #17243b 100%);
      color: #f3f4f6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
      position: relative;
      overflow-x: hidden;
    }

    /* 背景の装飾グロー */
    body::before {
      content: '';
      position: absolute;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(0, 0, 0, 0) 70%);
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 680px;
      width: 100%;
      background: rgba(30, 25, 45, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(244, 63, 94, 0.2);
      border: 1px solid rgba(244, 63, 94, 0.4);
      color: #fda4af;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 1.5rem;
    }

    .teapot-wrapper {
      position: relative;
      width: 170px;
      height: 150px;
      margin: 0 auto 1.5rem;
    }

    /* 湯気（スチーム）アニメーション */
    .steam {
      position: absolute;
      top: 5px;
      right: 20px;
      display: flex;
      gap: 6px;
    }

    .steam span {
      display: block;
      width: 6px;
      height: 35px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 10px;
      filter: blur(3px);
      animation: steamAnim 2.5s infinite ease-in-out;
      opacity: 0;
    }

    .steam span:nth-child(1) { animation-delay: 0.2s; }
    .steam span:nth-child(2) { animation-delay: 0.8s; }
    .steam span:nth-child(3) { animation-delay: 1.4s; }

    @keyframes steamAnim {
      0% {
        transform: translateY(0) scaleX(1);
        opacity: 0;
      }
      30% {
        opacity: 0.7;
      }
      60% {
        transform: translateY(-25px) scaleX(2.5) skewX(10deg);
        opacity: 0.4;
      }
      100% {
        transform: translateY(-45px) scaleX(3.5) skewX(-15deg);
        opacity: 0;
      }
    }

    .teapot-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
      transition: transform 0.3s ease;
    }

    .teapot-svg.tilt {
      transform: rotate(20deg);
    }

    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fcd34d 0%, #f472b6 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }

    .tagline {
      font-size: 1.2rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 1rem;
    }

    .description {
      font-size: 0.95rem;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .rfc-quote {
      background: rgba(0, 0, 0, 0.25);
      border-left: 4px solid #f472b6;
      padding: 0.75rem 1rem;
      margin: 1rem auto 1.75rem;
      text-align: left;
      font-family: monospace;
      font-size: 0.85rem;
      color: #cbd5e1;
      border-radius: 0 10px 10px 0;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
    }
    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      transform: translateY(-2px);
    }

    #message-box {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.3s ease;
      padding: 0.5rem 1rem;
      border-radius: 10px;
    }
    #message-box.tea {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    #message-box.coffee {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }

    .cli-box {
      background: rgba(15, 15, 25, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.85rem;
      color: #a5b4fc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: #64748b;
    }

    .footer-links a {
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: #f472b6;
    }

    @media (max-width: 600px) {
      h1 { font-size: 2.1rem; }
      .container { padding: 2rem 1.25rem; }
      .btn { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-badge">
      <span>●</span> HTTP 418 I'm a teapot
    </div>

    <div class="teapot-wrapper">
      <div class="steam">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <!-- Teapot SVG (Short and stout) -->
      <svg id="teapot" class="teapot-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fb7185"/>
            <stop offset="50%" stop-color="#e11d48"/>
            <stop offset="100%" stop-color="#9f1239"/>
          </linearGradient>
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#be123c"/>
          </linearGradient>
        </defs>
        <!-- 取っ手 (Handle) -->
        <path d="M 45 60 C 15 60, 10 115, 50 120" stroke="#fda4af" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- 注ぎ口 (Spout) -->
        <path d="M 145 95 Q 175 90, 185 65 Q 175 60, 155 78 Z" fill="url(#potGrad)" stroke="#fda4af" stroke-width="3"/>
        <!-- ポット本体 (Body: Short and stout) -->
        <ellipse cx="105" cy="98" rx="55" ry="42" fill="url(#potGrad)" stroke="#fda4af" stroke-width="3"/>
        <!-- 台座 (Base) -->
        <ellipse cx="105" cy="136" rx="35" ry="7" fill="#881337"/>
        <!-- 蓋 (Lid) -->
        <ellipse cx="105" cy="62" rx="32" ry="10" fill="url(#lidGrad)" stroke="#fda4af" stroke-width="3"/>
        <!-- 蓋のつまみ (Knob) -->
        <circle cx="105" cy="46" r="8" fill="#fecdd3" stroke="#e11d48" stroke-width="2"/>
        <!-- ハイライト光沢 -->
        <path d="M 75 75 Q 90 70, 115 72" stroke="rgba(255, 255, 255, 0.4)" stroke-width="4" stroke-linecap="round" fill="none"/>
      </svg>
    </div>

    <h1>418 I'm a teapot</h1>
    <p class="tagline">私はティーポットです（コーヒーは淹れられません）</p>

    <p class="description">
      このサーバーはティーポットであるため、コーヒーを淹れるリクエストをお断りしています。<br>
      お茶であれば喜んでご提供いたします。
    </p>

    <div class="rfc-quote">
      "Any attempt to brew coffee with a teapot should result in the error code 418 I'm a teapot. The resulting entity body MAY be short and stout."
      <div style="margin-top: 4px; text-align: right; color: #94a3b8;">— RFC 2324 (HTCPCP/1.0)</div>
    </div>

    <div id="message-box"></div>

    <div class="actions">
      <button class="btn btn-primary" onclick="brewTea()">🍵 お茶を淹れる (Brew Tea)</button>
      <button class="btn btn-danger" onclick="brewCoffee()">☕ コーヒーを淹れる (Brew Coffee)</button>
      <a href="/" class="btn btn-outline">🏠 トップへ戻る</a>
    </div>

    <div class="cli-box">
      <span id="curl-cmd">curl -i https://${url.host}/teapot</span>
      <button class="copy-btn" onclick="copyCurl()">コピー</button>
    </div>

    <div class="footer-links">
      <a href="https://www.rfc-editor.org/rfc/rfc2324" target="_blank" rel="noopener noreferrer">RFC 2324</a>
      <span>•</span>
      <a href="/teapot?format=json">JSON API</a>
      <span>•</span>
      <a href="https://hamuzon-jp.f5.si">hamuzon-jp.f5.si</a>
    </div>
  </div>

  <script>
    const msgBox = document.getElementById('message-box');
    const teapot = document.getElementById('teapot');

    function brewTea() {
      teapot.classList.add('tilt');
      msgBox.className = 'tea';
      msgBox.innerHTML = '🍵 美味しいアールグレイティーが淹れられました！どうぞお召し上がりください。';
      setTimeout(() => teapot.classList.remove('tilt'), 600);
    }

    function brewCoffee() {
      teapot.classList.add('tilt');
      msgBox.className = 'coffee';
      msgBox.innerHTML = '❌ エラー 418: ティーポットでコーヒーを淹れることはできません！';
      setTimeout(() => teapot.classList.remove('tilt'), 600);
    }

    function copyCurl() {
      const text = document.getElementById('curl-cmd').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'コピー完了!';
        setTimeout(() => btn.textContent = 'コピー', 2000);
      });
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 418,
    statusText: "I'm a teapot",
    headers
  });
}
