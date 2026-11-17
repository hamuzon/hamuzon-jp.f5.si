export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const acceptHeader = request.headers.get("accept") || "";
  const isJson = acceptHeader.includes("application/json") || url.searchParams.get("format") === "json";

  const headers = {
    "Cache-Control": "no-cache"
  };

  if (isJson) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    const jsonBody = JSON.stringify({
      status: 418,
      error: "I'm a teapot",
      message: "418 I'm a teapot: 私はティーポットです"
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>418 I'm a teapot - @hamuzon</title>

  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Potta+One&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Potta One', cursive, sans-serif;
      background: linear-gradient(to bottom, #ffcf91 0%, #a96bf8 100%);
      min-height: 100vh;
      color: #333;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      overflow-x: hidden;
    }

    .teapot-wrapper {
      margin-bottom: 0.75rem;
    }

    .teapot-svg {
      width: 140px;
      height: 110px;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
    }

    #fallback-teapot {
      display: none;
    }

    #fallback-teapot.show {
      display: inline-block;
    }

    .steam {
      opacity: 0.8;
      animation: steamAnim 2.4s infinite ease-in-out;
    }

    .steam-1 { animation-delay: 0s; }
    .steam-2 { animation-delay: 1.2s; }

    @keyframes steamAnim {
      0% {
        transform: translateY(0);
        opacity: 0.2;
      }
      50% {
        opacity: 0.9;
      }
      100% {
        transform: translateY(-10px);
        opacity: 0;
      }
    }

    h1 {
      font-size: 6rem;
      color: #f0f0f0;
      text-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
      margin: 0;
      line-height: 1;
    }

    p {
      font-size: 1.2rem;
      margin: 1rem 0;
      color: #f0f0f0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .subtext {
      font-size: 1rem;
      opacity: 0.7;
      margin-bottom: 2.5rem;
    }

    a.back {
      display: inline-block;
      background: rgba(20, 20, 20, 0.15);
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
      color: #ddd;
      text-decoration: none;
      padding: 1rem 2rem;
      border-radius: 16px;
      font-size: 1.1rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    a.back:hover {
      background: rgba(30, 30, 30, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
    }

    @media (max-width: 600px) {
      .teapot-svg { width: 110px; height: 85px; }
      h1 { font-size: 4rem; }
      p { font-size: 1.1rem; }
      .subtext { font-size: 0.9rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="teapot-wrapper">
      <img src="/teapot.svg" class="teapot-svg" alt="418 I'm a teapot" onerror="this.remove();document.getElementById('fallback-teapot').classList.add('show');" />
      <svg id="fallback-teapot" class="teapot-svg" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="steam steam-1" d="M 98 34 Q 102 24 98 14" stroke="#f0f0f0" stroke-width="2.5" stroke-linecap="round"/>
        <path class="steam steam-2" d="M 105 30 Q 109 20 105 10" stroke="#f0f0f0" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 35 50 C 14 50, 14 74, 35 74" stroke="#f0f0f0" stroke-width="6.5" stroke-linecap="round" fill="none"/>
        <path d="M 70 70 C 86 70, 96 56, 100 42 C 94 42, 86 48, 74 54 Z" fill="#f0f0f0"/>
        <ellipse cx="55" cy="63" rx="28" ry="19" fill="#f0f0f0"/>
        <path d="M 44 80 Q 55 83 66 80" stroke="rgba(0,0,0,0.15)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="55" cy="46" rx="18" ry="4" fill="#e8e8e8"/>
        <path d="M 42 46 C 42 38, 68 38, 68 46 Z" fill="#f0f0f0"/>
        <circle cx="55" cy="34" r="4.5" fill="#f0f0f0"/>
      </svg>
    </div>
    <h1>418</h1>
    <p>418 I'm a teapot: 私はティーポットです</p>
    <p class="subtext">Sorry, I'm a teapot.</p>
    <a id="backLink" class="back" href="/">トップページへ戻る</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 418,
    statusText: "I'm a teapot",
    headers
  });
}
